import storage from '@/storage';
import connection from '@/connection';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {NicoAPI} from '@/nico_client/nico_api';
import {toVideoDetailPostData} from '@/post_data/video_detail_post_data';
import util from '@/util';
import {NotifyPostData} from '@/post_data/notify_post_data';
import {BROWSER} from '@/browser';

const _cacheVideoDetail: { [watchId: string]: WatchDetailType } = {}
const getCacheValueDetail = async (watchId: string, isReload: boolean = false): Promise<WatchDetailType> =>{
    if (isReload || !_cacheVideoDetail[watchId]) _cacheVideoDetail[watchId] = await NicoAPI.getWatchDetail(watchId)
    return _cacheVideoDetail[watchId]
}
const getNotifyData = (valueId: number): ValuesNotify =>{
    return util.findValue(valueId, notifyList) ?? util.throwText(`登録された通知が見つかりませんでした\nID: ${valueId}: List: ${notifyList}`)
}
// TODO Notifyの形式ごとで処理を変える状態をまとめる
const funValuesNotify = {
    async getCurrentVideoDetailByValueId (valueId: number, isUseCache: boolean):  Promise<WatchDetailType | undefined> {
        const notify = getNotifyData(valueId)
        let findVideoId = notify.lastVideoId
        if (findVideoId){
            if (util.isInstanceOf<ValuesNotifySeries>(notify, 'seriesId')){
                const nextVideo = (await getCacheValueDetail(findVideoId)).data.series.video.next
                if (!nextVideo) return undefined
                findVideoId = nextVideo.id
            }
        } else {
            if (util.isInstanceOf<ValuesNotifySeries>(notify, 'seriesId')){
                // 最初の動画
                findVideoId = (await NicoAPI.getSeries(notify.seriesId)).data.items[0].video.id
            }
            findVideoId = findVideoId ?? util.throwText('動画ID取得に失敗')
        }
        return isUseCache ? getCacheValueDetail(findVideoId) : NicoAPI.getWatchDetail(findVideoId)
    },
    async getNewVideoDetail(notifyData: ValuesNotify): Promise<WatchDetailType>{
        let lastWatchId: string | undefined
        if (util.isInstanceOf<ValuesNotifySeries>(notifyData, 'seriesId')){
            const seriesData =  (await NicoAPI.getSeries(notifyData.seriesId))
            lastWatchId = seriesData.data.items[seriesData.data.items.length - 1].video.id
        }
        return lastWatchId ? getCacheValueDetail(lastWatchId) : util.throwText('最新の動画の取得に失敗')
    }
}
let notifyList: ValuesNotify[] = []
const showNotifyId: {[valueId: number]: string | undefined} = {}
// TODO v3はクソ https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
const initBackground = async () => {
    await storage.init()
    notifyList = storage.get('Notify_NotifyList').dynamicValues
    BROWSER.alarms.onAlarm.addListener(async (alarm) => {
        const v = getNotifyData(Number.parseInt(alarm.name))
        if (v) onCreateAlarm(v).then()
        // TODO アラーム動作時の挙動
    })
    for (const v of storage.get('Notify_NotifyList').dynamicValues) {
        onCreateAlarm(v).then()
    }

    connection.setConnectListener(async (key, args) => {
        switch (key){
            case 'add':
                return connection.run(key, args, async a => {
                    notifyList.push(a)
                    const param = storage.get('Notify_NotifyList')
                    param.dynamicValues = notifyList
                    storage.set('Notify_NotifyList', param)
                    return undefined
                })
            case 'list':
                return connection.run(key, args, async _ => {
                    const result: NotifyPostData[] = []
                    for (const value of notifyList) {
                        if (util.isInstanceOf<ValuesNotifySeries>(value, 'seriesId')){
                            result.push({
                                valueId: value.valueId,
                                title: value.seriesName,
                                isNotify: false,
                                titleLink: 'https://www.nicovideo.jp/series/' + value.seriesId
                            })
                        }
                    }
                    return result
                })
            case 'detail':
                return connection.run(key, args, async a => {
                    let nId = showNotifyId[a]
                    if (!nId){
                        let showWatchId: string | undefined
                        const notify = getNotifyData(a)
                        if (notify.lastVideoId){
                            showWatchId = (await getCacheValueDetail(notify.lastVideoId)).data.series.video.next?.id
                        } else {
                            if (util.isInstanceOf<ValuesNotifySeries>(notify, 'seriesId')){
                                // 最初の動画
                                showWatchId = (await NicoAPI.getSeries(notify.seriesId)).data.items[0].video.id
                            }
                        }
                        if (!showWatchId) return undefined
                        nId = showWatchId
                        showNotifyId[a] = nId
                    }
                    return toVideoDetailPostData(await getCacheValueDetail(nId))
                })
            case 'next':
                return connection.run(key, args, async a => {
                    const nId = showNotifyId[a]
                    if (!nId) return undefined
                    const nextId =(await getCacheValueDetail(nId)).data.series.video.next?.id
                    const i = util.findIndex(a, notifyList)
                    notifyList[i].lastVideoId = showNotifyId[a]
                    const param = storage.get('Notify_NotifyList')
                    param.dynamicValues = notifyList
                    storage.set('Notify_NotifyList', param)
                    showNotifyId[a] = nextId
                    return undefined
                })
            case 'prev':
                return connection.run(key, args, async a => {
                    const nId = showNotifyId[a]
                    const prevId = nId ? (await getCacheValueDetail(nId)).data.series.video.prev?.id : getNotifyData(a).lastVideoId
                    if (prevId){
                        showNotifyId[a] = prevId
                        const lastWatchId = (await getCacheValueDetail(prevId)).data.series.video.prev?.id
                        const i = util.findIndex(a, notifyList)
                        notifyList[i].lastVideoId = lastWatchId
                        const param = storage.get('Notify_NotifyList')
                        param.dynamicValues = notifyList
                        storage.set('Notify_NotifyList', param)
                    }
                    return undefined
                })
            case 'watch_detail':
                return connection.run(key, args, async a => {
                    return await getCacheValueDetail(a)
                })
            case 'remove':
                return connection.run(key, args, async a => {
                    const index = util.findIndex(a, notifyList)
                    notifyList.splice(index, 1)
                    const param = storage.get('Notify_NotifyList')
                    param.dynamicValues = notifyList
                    storage.set('Notify_NotifyList', param)
                    return undefined
                })
            case 'get_notify':
                return connection.run(key, args, async a =>{
                    return getNotifyData(a)
                })
            case 'edit':
                return connection.run(key, args, async a =>{
                    const index = util.findIndex(a.valueId, notifyList)
                    notifyList[index] = a
                    const param = storage.get('Notify_NotifyList')
                    param.dynamicValues = notifyList
                    storage.set('Notify_NotifyList', param)
                    return undefined
                })
            case 'is_new_notify':
                return connection.run(key, args, async a=>{
                    try {
                        const notifyData = getNotifyData(a)
                        const lastWatchDetail = await funValuesNotify.getNewVideoDetail(notifyData)
                        // TODO 途中から入れた変数なので、undefinedの可能性あり
                        return new Date(notifyData.lastCheckDateTime ?? Date.now()).getTime() < new Date(lastWatchDetail.data.video.registeredAt).getTime()
                    }catch (e) {
                        return false
                    }
                })
            case 'read_notify':
                return connection.run(key, args, async a =>{
                    const index = util.findIndex(a, notifyList)
                    notifyList[index].lastCheckDateTime = Date.now()
                    const param = storage.get('Notify_NotifyList')
                    param.dynamicValues = notifyList
                    storage.set('Notify_NotifyList', param)
                    return undefined
                })
            case 'reload':
                return connection.run(key, args, async a =>{
                    const notifyData = getNotifyData(a)
                    if (notifyData.lastVideoId){
                        await getCacheValueDetail(notifyData.lastVideoId, true)
                    }
                    return undefined
                })
            default:
                console.error('メッセージ取得に失敗')
                console.log(args)
                return

        }
    })
}

const onCreateAlarm = async (notifyValue: ValuesNotify) => {
    if (!notifyValue.isInterval) return
    if (!notifyValue.intervalTime) return
    await BROWSER.alarms.clear(notifyValue.valueId.toString())

    const nowDate = new Date()
    const nowDayOfWeek = nowDate.getDay()
    const nowHour = `${nowDate.getHours().toString().padStart(2, '0')}:${nowDate.getMinutes().toString().padStart(2, '0')}`
    let dayOfWeek = nowDayOfWeek
    let counter
    for (counter = 0; counter < 7; counter++) {
        if (notifyValue.intervalWeek.indexOf(dayOfWeek) !== -1) {
            if (dayOfWeek === nowDayOfWeek) {
                if (nowHour === notifyValue.intervalTime) {
                    //確認処理
                    return
                } else if (nowHour < notifyValue.intervalTime) {
                    break
                }
            } else {
                break
            }
        }
        dayOfWeek++
        if (dayOfWeek >= 7) {
            dayOfWeek = 0
        }
    }
    const nextDay = new Date()
    nextDay.setDate(nextDay.getDate() + counter)
    nextDay.setHours(Number.parseInt(notifyValue.intervalTime.substring(0, 2)), Number.parseInt(notifyValue.intervalTime.substring(3, 5)), 0, 0)
    BROWSER.alarms.create(notifyValue.valueId.toString(), {
        when: nextDay.getTime()
    })
}

BROWSER.onInstalled.addListener(initBackground)
BROWSER.onStartup.addListener(initBackground)

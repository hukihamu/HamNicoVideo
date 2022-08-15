import storage from '@/storage';
import connection from '@/connection';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {NicoAPI} from '@/nico_client/nico_api';
import {toVideoDetailPostData} from '@/post_data/video_detail_post_data';
import util, {findValue, throwText} from '@/util';
import {NotifyPostData} from '@/post_data/notify_post_data';
import {BROWSER} from '@/browser';

const _cacheVideoDetail: { [watchId: string]: WatchDetailType } = {}
const getCacheValueDetail = async (watchId: string): Promise<WatchDetailType> =>{
    if (!_cacheVideoDetail[watchId]) _cacheVideoDetail[watchId] = await NicoAPI.getWatchDetail(watchId)
    return _cacheVideoDetail[watchId]
}
let notifyList: ValuesNotifySeries[] = []
const showNotifyId: {[valueId: number]: string | undefined} = {}
// TODO https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
const initBackground = async () => {
    await storage.init()
    notifyList = storage.get('Notify_NotifyList').dynamicValues
    BROWSER.alarms.onAlarm.addListener(async (alarm) => {
        const v = findValue(Number.parseInt(alarm.name), storage.get('Notify_NotifyList').dynamicValues)
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
                return connection.run(key, args, async a => {
                    const result: NotifyPostData[] = []
                    for (const value of notifyList) {
                        result.push({
                            valueId: value.valueId,
                            title: value.seriesName,
                            isNotify: false,
                            titleLink: 'https://www.nicovideo.jp/series/' + value.seriesId
                        })
                    }
                    return result
                })
            case 'detail':
                return connection.run(key, args, async a => {
                    let nId = showNotifyId[a]
                    if (!nId){
                        let showWatchId: string | undefined
                        const notify = findValue(a, notifyList) ?? throwText(`登録された通知が見つかりませんでした\nID: ${args}: List: ${notifyList}`)
                        if (notify.lastVideoId && notify.lastVideoId !== 'first'){
                            showWatchId = (await getCacheValueDetail(notify.lastVideoId)).data.series.video.next?.id
                        } else {
                            // 最初の動画
                            showWatchId = (await NicoAPI.getSeries(notify.seriesId)).data.items[0].id
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
                    const prevId = nId ? (await getCacheValueDetail(nId)).data.series.video.prev?.id : util.findValue(a, notifyList)?.lastVideoId
                    if (prevId){
                        showNotifyId[a] = prevId
                        const lastWatchId = (await getCacheValueDetail(prevId)).data.series.video.prev?.id ?? 'first'
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
            default:
                console.error('メッセージ取得に失敗')
                console.log(args)
                return

        }
    })
}

const onCreateAlarm = async (notifyValue: ValuesNotifySeries) => {
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

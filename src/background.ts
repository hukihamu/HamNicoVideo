import storage from '@/storage';
import connection from '@/connection';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {NicoAPI} from '@/nico_client/nico_api';
import {toVideoDetailPostData} from '@/post_data/video_detail_post_data';
import util from '@/util';
import {NotifyPostData} from '@/post_data/notify_post_data';
import {BROWSER} from '@/browser';
import {ValuesNotify} from '@/storage/parameters/values_type/values_notify';
import {Notify} from '@/notify/notify';
const getNotifyData = (valueId: number): ValuesNotify =>{
    return util.findValue(valueId, notifyList) ?? util.throwText(`登録された通知が見つかりませんでした\nID: ${valueId}`)
}
const hasNotify = async (valueId: number): Promise<boolean>=>{
    try {
        const notifyData = getNotifyData(valueId)
        const lastWatchDetail = await Notify.Background.getLastedWatchId(notifyData)
        return new Date(notifyData.config.lastCheckDateTime).getTime() < new Date(lastWatchDetail.data.video.registeredAt).getTime()
    }catch (e) {
        return false
    }
}
let notifyList: ValuesNotify[] = []
const showNotifyId: {[valueId: number]: string | undefined} = {}
// TODO v3はクソ https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
const initBackground = async () => {
    await storage.init()
    notifyList = storage.get('Notify_NotifyList').config.dynamicValues
    BROWSER.alarms.onAlarm.addListener(async (alarm) => {
        const v = getNotifyData(Number.parseInt(alarm.name))
        if (v) onCreateAlarm(v).then()
        // TODO アラーム動作時の挙動
    })
    for (const v of storage.get('Notify_NotifyList').config.dynamicValues) {
        onCreateAlarm(v).then()
    }

    connection.setConnectListener(async (key, args) => {
        switch (key){
            case 'add':
                return connection.run(key, args, async a => {
                    notifyList.push(a)
                    const param = storage.get('Notify_NotifyList')
                    param.config.dynamicValues = notifyList
                    storage.set('Notify_NotifyList', param)
                    return undefined
                })
            case 'list':
                return connection.run(key, args, async _ => {
                    const result: NotifyPostData[] = []
                    for (const value of notifyList) {
                        result.push(Notify.Background.createNotifyPostData(value))
                    }
                    return result
                })
            case 'detail':
                return connection.run(key, args, async a => {
                    let nId = showNotifyId[a]
                    if (!nId){
                        const notify = getNotifyData(a)
                        nId = await Notify.Background.getCurrentWatchId(notify)
                        if (!nId) return
                        showNotifyId[a] = nId
                    }
                    return toVideoDetailPostData(await Notify.Background.getCacheWatchDetail(nId))
                })
            case 'next':
                return connection.run(key, args, async a => {
                    const nId = showNotifyId[a]
                    if (!nId) return
                    const nextId = await Notify.Background.getNextWatchId(getNotifyData(a), nId)
                    const i = util.findIndex(a, notifyList)
                    notifyList[i].config.lastWatchId = showNotifyId[a]
                    const param = storage.get('Notify_NotifyList')
                    param.config.dynamicValues = notifyList
                    storage.set('Notify_NotifyList', param)
                    showNotifyId[a] = nextId
                    return undefined
                })
            case 'prev':
                return connection.run(key, args, async a => {
                    const notify = getNotifyData(a)
                    const prevId = notify.config.lastWatchId
                    if (prevId){
                        showNotifyId[a] = prevId
                        const lastWatchId = await Notify.Background.getPrevWatchId(notify, prevId)
                        const i = util.findIndex(a, notifyList)
                        notifyList[i].config.lastWatchId = lastWatchId
                        const param = storage.get('Notify_NotifyList')
                        param.config.dynamicValues = notifyList
                        storage.set('Notify_NotifyList', param)
                    }
                    return undefined
                })
            // TODO 削除したい
            case 'watch_detail':
                return connection.run(key, args, async a => {
                    return await Notify.Background.getCacheWatchDetail(a)
                })
            case 'remove':
                return connection.run(key, args, async a => {
                    const index = util.findIndex(a, notifyList)
                    notifyList.splice(index, 1)
                    const param = storage.get('Notify_NotifyList')
                    param.config.dynamicValues = notifyList
                    storage.set('Notify_NotifyList', param)
                    return undefined
                })
            case 'get_notify':
                return connection.run(key, args, async a =>{
                    return getNotifyData(a)
                })
            case 'edit':
                return connection.run(key, args, async a =>{
                    const index = util.findIndex(a.config.valueId, notifyList)
                    notifyList[index] = a
                    const param = storage.get('Notify_NotifyList')
                    param.config.dynamicValues = notifyList
                    storage.set('Notify_NotifyList', param)
                    return undefined
                })
            case 'is_new_notify':
                return connection.run(key, args, async a=> hasNotify(a) )
            case 'read_notify':
                return connection.run(key, args, async a =>{
                    const index = util.findIndex(a, notifyList)
                    notifyList[index].config.lastCheckDateTime = Date.now()
                    const param = storage.get('Notify_NotifyList')
                    param.config.dynamicValues = notifyList
                    storage.set('Notify_NotifyList', param)
                    return undefined
                })
            case 'reload':
                return connection.run(key, args, async a =>{
                    const notifyData = getNotifyData(a)
                    if (notifyData.config.lastWatchId){
                        await Notify.Background.getCacheWatchDetail(notifyData.config.lastWatchId, true)
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
    if (!notifyValue.config.isInterval) return
    if (!notifyValue.config.intervalTime) return
    await BROWSER.alarms.clear(notifyValue.config.valueId.toString())

    const nowDate = new Date()
    const nowDayOfWeek = nowDate.getDay()
    const nowHour = `${nowDate.getHours().toString().padStart(2, '0')}:${nowDate.getMinutes().toString().padStart(2, '0')}`
    let dayOfWeek = nowDayOfWeek
    let counter
    for (counter = 0; counter < 7; counter++) {
        if (notifyValue.config.intervalWeek.indexOf(dayOfWeek) !== -1) {
            if (dayOfWeek === nowDayOfWeek) {
                if (nowHour === notifyValue.config.intervalTime) {
                    //確認処理
                    return
                } else if (nowHour < notifyValue.config.intervalTime) {
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
    nextDay.setHours(Number.parseInt(notifyValue.config.intervalTime.substring(0, 2)), Number.parseInt(notifyValue.config.intervalTime.substring(3, 5)), 0, 0)
    BROWSER.alarms.create(notifyValue.config.valueId.toString(), {
        when: nextDay.getTime()
    })
}

BROWSER.onInstalled.addListener(initBackground)
BROWSER.onStartup.addListener(initBackground)

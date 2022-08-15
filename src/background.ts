import storage from '@/storage';
import connection from '@/connection';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {NicoAPI} from '@/nico_client/nico_api';
import {toVideoDetailPostData} from '@/post_data/video_detail_post_data';
import {findValue, throwText} from '@/util';
import {NotifyPostData} from '@/post_data/notify_post_data';
import {BROWSER} from '@/browser';

const cacheVideoDetail: { [watchId: string]: WatchDetailType } = {}
const getCacheValueDetail = async (watchId: string): Promise<WatchDetailType> =>{
    if (!cacheVideoDetail[watchId]) cacheVideoDetail[watchId] = await NicoAPI.getWatchDetail(watchId)
    return cacheVideoDetail[watchId]
}
let notifyList: ValuesNotifySeries[] = []
const showNotifyId: {[valueId: number]: string} = {}
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
        if (connection.isInstanceof('add', key, args)) {
            notifyList.push(args)
            const param = storage.get('Notify_NotifyList')
            param.dynamicValues = notifyList
            storage.set('Notify_NotifyList', param)
            return
        } else if (connection.isInstanceof('list', key, args)) {
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
        } else if (connection.isInstanceof('detail', key, args)) {
            if (!showNotifyId[args]){
                let showWatchId: string | undefined
                const notify = findValue(args, notifyList) ?? throwText(`登録された通知が見つかりませんでした\nID: ${args}: List: ${notifyList}`)
                if (notify.lastVideoId && notify.lastVideoId !== 'first'){
                    showWatchId = (await getCacheValueDetail(notify.lastVideoId)).data.series.video.next?.id
                } else {
                    // 最初の動画
                    showWatchId = (await NicoAPI.getSeries(notify.seriesId)).data.items[0].id
                }
                showNotifyId[args] = showWatchId ?? throwText('表示する動画IDが見つかりませんでした')
            }
            if (!cacheVideoDetail[showNotifyId[args]]) {
                cacheVideoDetail[showNotifyId[args]] = await NicoAPI.getWatchDetail(showNotifyId[args])
            }
            return toVideoDetailPostData(cacheVideoDetail[args])
        } else if (connection.isInstanceof('watch_detail', key, args)) {
            if (!cacheVideoDetail[args]) {
                cacheVideoDetail[args] = await NicoAPI.getWatchDetail(args)
            }
            return cacheVideoDetail[args]
        } else if (connection.isInstanceof('prev', key, args)) {
            if (!cacheVideoDetail[args]) {
                cacheVideoDetail[args] = await NicoAPI.getWatchDetail(args)
            }
            const prevId = cacheVideoDetail[args].data.series.video.prev?.id
            if (prevId){

                const param = storage.get('Notify_NotifyList')
                param.dynamicValues.push(args)
                storage.set('Notify_NotifyList', param)
            }

            return prevId
        } else if (connection.isInstanceof('next', key, args)) {
            // if (!cacheVideoDetail[args]) {
            //     cacheVideoDetail[args] = await NicoAPI.getWatchDetail(args)
            // }
            // const nextId = cacheVideoDetail[args].data.series.video.next?.id
            // if (!nextId) return
            // if (!cacheVideoDetail[nextId]) {
            //     cacheVideoDetail[nextId] = await NicoAPI.getWatchDetail(nextId)
            // }
            // return cacheVideoDetail[nextId]
            return
        } else {
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

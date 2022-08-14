import storage from '@/storage';
import connection from '@/connection';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {NicoAPI} from '@/nico_client/nico_api';
import {toVideoDetailPostData} from '@/post_data/video_detail_post_data';
import {findValue} from '@/util';
import {NotifyPostData} from '@/post_data/notify_post_data';

const cacheVideoDetail: { [key: string]: WatchDetailType } = {}
// TODO https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
const initBackground = async () => {
    await storage.init()
    chrome.tabs.create({url: '/background.html', }).then()
    chrome.alarms.onAlarm.addListener(async (alarm) => {
        const v = findValue(Number.parseInt(alarm.name), storage.get('Notify_NotifyList').dynamicValues)
        onCreateAlarm(v).then()
        // TODO アラーム動作時の挙動
    })
    for (const v of storage.get('Notify_NotifyList').dynamicValues) {
        onCreateAlarm(v).then()
    }

    connection.setConnectListener(async (key, args) => {
        if (connection.isInstanceof('add', key, args)) {
            const param = storage.get('Notify_NotifyList')
            param.dynamicValues.push(args)
            storage.set('Notify_NotifyList', param)
            return
        } else if (connection.isInstanceof('list', key, args)) {
            // TODO videoId
            const result: NotifyPostData[] = []
            for (const value of storage.get('Notify_NotifyList').dynamicValues) {
                if (!value.lastVideoId) {
                    // 最後の動画を取得できないので、取りに行く
                    const series =await NicoAPI.getSeries(value.seriesId)
                    value.lastVideoId = series.data.items[0].id
                }
                if (!cacheVideoDetail[value.lastVideoId]) {
                    cacheVideoDetail[value.lastVideoId] = await NicoAPI.getWatchDetail(value.lastVideoId)
                }
                result.push({
                    valueId: value.valueId,
                    videoId: cacheVideoDetail[value.lastVideoId].data.series.video.next?.id,
                    title: value.seriesName,
                    isNotify: false,
                    titleLink: 'https://www.nicovideo.jp/series/' + value.seriesId
                })
            }
            return result
        } else if (connection.isInstanceof('detail', key, args)) {
            if (!cacheVideoDetail[args]) {
                cacheVideoDetail[args] = await NicoAPI.getWatchDetail(args)
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
            if (!prevId) return
            if (!cacheVideoDetail[prevId]) {
                cacheVideoDetail[prevId] = await NicoAPI.getWatchDetail(prevId)
            }
            return cacheVideoDetail[prevId]
        } else {
            console.error('メッセージ取得に失敗')
            console.log(args)
        }
    })
}

const onCreateAlarm = async (notifyValue: ValuesNotifySeries) => {
    if (!notifyValue.isInterval) return
    await chrome.alarms.clear(notifyValue.valueId.toString())

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
    chrome.alarms.create(notifyValue.valueId.toString(), {
        when: nextDay.getTime()
    })
}

chrome.runtime.onInstalled.addListener(initBackground)
chrome.runtime.onStartup.addListener(initBackground)

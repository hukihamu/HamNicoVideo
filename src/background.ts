import storage from '@/storage';
import connection from '@/connection';
import util from '@/util';
import {NotifyPostData} from '@/post_data/notify_post_data';
import {BROWSER} from '@/browser';
import {ValuesNotify} from '@/storage/parameters/values_type/values_notify';
import {CachePostData, Notify} from '@/notify/notify';
import {NicoAPI} from '@/nico_client/nico_api';

const cachePostData: CachePostData = {} // API取得データ格納用
let notifyList: ValuesNotify[] =  [] // storage格納用(メモリ退避)
let isInitStorage = false
let isInitLoad = false
const getNotifyData = (valueId: number): ValuesNotify =>{
    return util.findValue(valueId, notifyList) ?? util.throwText(`登録された通知が見つかりませんでした\nID: ${valueId}`)
}
const newNotifyIds = class {
    private static newNotifyIds: Set<number> | undefined

    public static async get(): Promise<Set<number>> {
        return this.newNotifyIds ??= new Set<number>(Array.from((await storage.getCache('newNotifyIds') ?? [])))
    }
    public static set(ids: Set<number>) {
        this.newNotifyIds = ids
    }
    public static save(){
        storage.setCache('newNotifyIds', Array.from(this.newNotifyIds?.values() ?? [])).then()
    }
}


const onStartupBackground = async () => {
    await storage.init()
    isInitStorage = true
    notifyList = storage.get('Notify_NotifyList').config.dynamicValues

    for (const notifyValue of notifyList){
        // アラーム設定
        onCreateAlarm(notifyValue)
        // 未読確認
        await addNewNotify(notifyValue).then(()=>showBadgeText())
    }
    newNotifyIds.save()
}
const onLoadBackground = async () => {
    if (!isInitLoad){
        if (!isInitStorage){
            await storage.init()
            isInitStorage = true
        }
        notifyList = storage.get('Notify_NotifyList').config.dynamicValues

        BROWSER.alarms.onAlarm.addListener(alarm => {
            // アラーム動作時の挙動
            const v = getNotifyData(Number.parseInt(alarm.name))
            if (v) {
                onCreateAlarm(v)
                addNewNotify(v).then(() => {
                    showBadgeText()
                    newNotifyIds.save()
                })
            }
        })

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
                            const bn = Notify.getBackgroundNotify(value,cachePostData)
                            result.push(bn.createNotifyPostData())
                        }
                        return result
                    })
                case 'detail':
                    return connection.run(key, args, async a => {
                        const notify = getNotifyData(a)
                        const bn = Notify.getBackgroundNotify(notify,cachePostData)
                        if (!cachePostData[notify.config.valueId]) await bn.setCache()
                        if (!notify.config.lastWatchId) return bn.firstVideoDetailPostData()
                        return bn.currentVideoDetailPostData()
                    })
                case 'next':
                    return connection.run(key, args, async a => {
                        const notify = getNotifyData(a)
                        const bn = Notify.getBackgroundNotify(notify,cachePostData)
                        if (!cachePostData[notify.config.valueId]) await bn.setCache()
                        const i = util.findIndex(a, notifyList)
                        await bn.nextWatchId()
                        notifyList[i] = notify
                        const param = storage.get('Notify_NotifyList')
                        param.config.dynamicValues = notifyList
                        storage.set('Notify_NotifyList', param)
                        return
                    })
                case 'prev':
                    return connection.run(key, args, async a => {
                        const notify = getNotifyData(a)
                        const prevId = notify.config.lastWatchId
                        if (prevId){
                            const bn = Notify.getBackgroundNotify(notify,cachePostData)
                            if (!cachePostData[notify.config.valueId]) await bn.setCache()
                            const i = util.findIndex(a, notifyList)
                            await bn.prevWatchId()
                            notifyList[i] = notify
                            const param = storage.get('Notify_NotifyList')
                            param.config.dynamicValues = notifyList
                            storage.set('Notify_NotifyList', param)
                        }
                        return undefined
                    })
                case 'watch_detail':
                    return connection.run(key, args, async a => {
                        return await NicoAPI.getWatchDetail(a)
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
                    return connection.run(key, args, async a=> {
                        return newNotifyIds.get().then(it =>it.has(a))
                    } )
                case 'read_notify': // 既読
                    return connection.run(key, args, async a =>{
                        const index = util.findIndex(a, notifyList)
                        notifyList[index].config.lastCheckDateTime = Date.now()
                        const param = storage.get('Notify_NotifyList')
                        param.config.dynamicValues = notifyList
                        storage.set('Notify_NotifyList', param)
                        // 未読件数から削除
                        const ids = await newNotifyIds.get()
                        ids.delete(a)
                        newNotifyIds.set(ids)
                        showBadgeText()
                        newNotifyIds.save()
                        return undefined
                    })
                case 'reload':
                    return connection.run(key, args, async a =>{
                        const notify = getNotifyData(a)
                        if (notify.config.lastWatchId){
                            return addNewNotify(notify).then(it => {
                                if (it) {
                                    showBadgeText()
                                    newNotifyIds.save()
                                }
                                return it
                            })
                        }
                        return false
                    })
                default:
                    console.error('メッセージ取得に失敗', args)
                    return
            }
        })
        isInitLoad = true
    }
}

const onCreateAlarm = (notifyValue: ValuesNotify) => {
    (async (notifyValue: ValuesNotify): Promise<void> => {
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
    })(notifyValue).then()
}

const addNewNotify = async (notifyValue: ValuesNotify):Promise<boolean> =>{
    const bn = Notify.getBackgroundNotify(notifyValue, cachePostData)
    await bn.setCache()
    // 未読追加
    if (await bn.isNewVideo()){
        const ids = await newNotifyIds.get()
        ids.add(notifyValue.config.valueId)
        newNotifyIds.set(ids)
        return true
    }
    return false
}
const showBadgeText = ()=>{
    (async () => {
        const ids = await newNotifyIds.get()
        BROWSER.mSetBadgeText(ids.size ? ids.size.toString() : '')
    })().then()
}
BROWSER.onStartup.addListener(onStartupBackground)
BROWSER.onInstalled.addListener(onStartupBackground)
BROWSER.onMessage.addListener((message, sender, sendResponse) => {
    if (!isInitLoad) sendResponse(connection.NO_RESPONSE)
    return false
})
onLoadBackground().then()
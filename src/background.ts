import storage from '@/storage';
import connection from '@/connection';
import util from '@/util';
import {NotifyPostData} from '@/post_data/notify_post_data';
import {BROWSER} from '@/browser';
import {ValuesNotify} from '@/storage/parameters/values_type/values_notify';
import {CachePostData, Notify} from '@/notify/notify';
import {NicoAPI} from '@/nico_client/nico_api';
const cache = class {
    private static _newNotifyList: Set<number> | undefined// カウント用
    private static _cachePostData: CachePostData | undefined // API取得データ格納用
    public static get newNotifyList(): Promise<Set<number>>{
        return new Promise(async (resolve) => {
            resolve(this._newNotifyList ??= new Set<number>((await storage.getCache('newNotifyList'))?.newNotifyList ?? []))
        })
    }
    public static get cachePostData(): Promise<CachePostData>{
        return new Promise(async (resolve) => {
            resolve(this._cachePostData ??= await storage.getCache('cachePostData'))
        })
    }

    public static saveNewNotifyList(): void{
        storage.setCache('newNotifyList', Array.from(this._newNotifyList?.values() ?? [])).then()
    }
    public static saveCachePostData(): void{
        storage.setCache('cachePostData', this._cachePostData).then()
    }
}
let notifyList: ValuesNotify[] =  [] // storage格納用(メモリ退避)
let isInitStorage = false
let isInitLoad = false
const getNotifyData = (valueId: number): ValuesNotify =>{
    return util.findValue(valueId, notifyList) ?? util.throwText(`登録された通知が見つかりませんでした\nID: ${valueId}`)
}

const onStartupBackground = async () => {
    await storage.init()
    isInitStorage = true
    // cache.saveNewNotifyList()
    notifyList = storage.get('Notify_NotifyList').config.dynamicValues
    for (const v of storage.get('Notify_NotifyList').config.dynamicValues) {
        // アラーム設定
        onCreateAlarm(v).then()
        // 未読確認
        checkAndShowNotify(v).then()
    }
}
const onLoadBackground = async () => {
    if (!isInitStorage){
        await storage.init()
        isInitStorage = true
    }
    notifyList = storage.get('Notify_NotifyList').config.dynamicValues

    BROWSER.alarms.onAlarm.addListener(alarm => {
        // アラーム動作時の挙動
        const v = getNotifyData(Number.parseInt(alarm.name))
        if (v) onCreateAlarm(v).then()
        checkAndShowNotify(v).then()
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
                        const bn = Notify.getBackgroundNotify(value,await cache.cachePostData)
                        result.push(bn.createNotifyPostData())
                    }
                    cache.saveCachePostData()
                    return result
                })
            case 'detail':
                return connection.run(key, args, async a => {
                    const notify = getNotifyData(a)
                    const cpd = await cache.cachePostData
                    const bn = Notify.getBackgroundNotify(notify,cpd)
                    if (!cpd[notify.config.valueId]) await bn.setCache()
                    if (!notify.config.lastWatchId) return bn.firstVideoDetailPostData()
                    cache.saveCachePostData()
                    return bn.currentVideoDetailPostData()
                })
            case 'next':
                return connection.run(key, args, async a => {
                    const notify = getNotifyData(a)
                    const bn = Notify.getBackgroundNotify(notify,await cache.cachePostData)
                    const i = util.findIndex(a, notifyList)
                    await bn.nextWatchId()
                    notifyList[i] = notify
                    const param = storage.get('Notify_NotifyList')
                    param.config.dynamicValues = notifyList
                    storage.set('Notify_NotifyList', param)
                    cache.saveCachePostData()
                    return
                })
            case 'prev':
                return connection.run(key, args, async a => {
                    const notify = getNotifyData(a)
                    const prevId = notify.config.lastWatchId
                    if (prevId){
                        const bn = Notify.getBackgroundNotify(notify,await cache.cachePostData)
                        const i = util.findIndex(a, notifyList)
                        await bn.prevWatchId()
                        notifyList[i] = notify
                        const param = storage.get('Notify_NotifyList')
                        param.config.dynamicValues = notifyList
                        storage.set('Notify_NotifyList', param)
                        cache.saveCachePostData()
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
                    return (await cache.newNotifyList).has(a)
                } )
            case 'read_notify': // 既読
                return connection.run(key, args, async a =>{
                    const index = util.findIndex(a, notifyList)
                    notifyList[index].config.lastCheckDateTime = Date.now()
                    const param = storage.get('Notify_NotifyList')
                    param.config.dynamicValues = notifyList
                    storage.set('Notify_NotifyList', param)
                    // 未読件数から削除
                    const nnl = await cache.newNotifyList
                    nnl.delete(notifyList[index].config.valueId)
                    cache.saveNewNotifyList()
                    showBadgeText()
                    return undefined
                })
            case 'reload':
                return connection.run(key, args, async a =>{
                    const notify = getNotifyData(a)
                    if (notify.config.lastWatchId){
                        return checkAndShowNotify(notify)
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

const checkAndShowNotify = async (notifyValue: ValuesNotify): Promise<boolean>=>{
    const bn = Notify.getBackgroundNotify(notifyValue, await cache.cachePostData)
    await bn.setCache()
    // 未読追加
    const result = await bn.isNewVideo()
    if (result){
        const nnl = await cache.newNotifyList
        nnl.add(notifyValue.config.valueId)
        showBadgeText()
        cache.saveNewNotifyList()
    }
    cache.saveCachePostData()
    return result
}
const showBadgeText = ()=>{
    cache.newNotifyList.then(it => {
        BROWSER.setBadgeText(it.size ? it.size.toString() : '')
    })
}
BROWSER.onStartup.addListener(onStartupBackground)
BROWSER.onInstalled.addListener(onStartupBackground)
BROWSER.onMessage.addListener((message, sender, sendResponse) => {
    if (!message) sendResponse(isInitLoad)
})
onLoadBackground().then()

import {NotifyPostData} from '@/post_data/notify_post_data';
import {VideoDetailPostData} from '@/post_data/video_detail_post_data';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {BROWSER} from '@/browser';
import {ValuesNotify} from '@/storage/parameters/values_type/values_notify';
import connection from '@/connection'
import Util from '@/util'

interface ConnectType  {
    add: { // 通知追加
        args: ValuesNotify,
        result: void
    }
    list: { // 通知一覧取得
        args: undefined,
        result: NotifyPostData[]
    }
    edit: { // 通知編集
        args: ValuesNotify,
        result: void
    }
    get_notify: { // 編集元通知取得
        args: number, // valueId
        result: ValuesNotify
    }
    remove: { // 通知削除
        args: number, // valueId
        result: void
    }
    detail: { // 動画情報取得
        args: number, // valueId
        result: VideoDetailPostData | undefined
    }
    next: { // 次動画遷移
        args: number, // valueId
        result: void
    }
    prev: { // 前動画遷移
        args: number, // valueId
        result: void
    }
    watch_detail: { // 入力補助のため動画生データ取得
        args: string, // watchId
        result: WatchDetailType
    }
    is_new_notify: { // カウント済み新着動画確認
        args: number // valueId
        result: boolean
    }
    read_notify: { // 既読
        args: number // valueId
        result: void
    }
    reload: { // 新着確認
        args: number // valueId
        result: boolean
    }
}
export default {
    connect: async <K extends keyof ConnectType>(key: K, args?: ConnectType[K]['args']): Promise<ConnectType[K]['result']>=>{
        for (let i = 0; i < 100; i++) {
            const response = await BROWSER.mSendMessage({key, args})
            if (response !== connection.NO_RESPONSE){
                return response
            }
            await Util.sleep(100)
        }
        throw 'backgroundに接続できません'

            // BROWSER.sendMessage(undefined, response => {
            //     if (response) {
            //         BROWSER.sendMessage({key, args}, response => {
            //             resolve(response)
            //             return true
            //         })
            //     }else {
            //         let count = 0
            //         const interval = setInterval(() => {
            //             BROWSER.sendMessage(undefined, response => {
            //                 if (response) {
            //                     clearInterval(interval)
            //                     BROWSER.sendMessage({key, args}, response => {
            //                         resolve(response)
            //                         return true
            //                     })
            //                 }
            //                 if (count > 10) {
            //                     clearInterval(interval)
            //                     throw
            //                 }
            //                 count++
            //             })
            //         }, 1000)
            //     }
            // })
    },
    setConnectListener: <K extends keyof ConnectType>(listener: (key: K, args: ConnectType[K]['args'])=>Promise<ConnectType[K]['result']>)=>{
        BROWSER.onMessage.addListener((message, sender, sendResponse) => {
            listener(message.key, message.args).then(async result => {
                await Util.sleep(1000)
                sendResponse(result)
            })
            return true
        })
    },
    isInstanceof: <K extends keyof ConnectType>(target: K, key: string, value: any)
        : value is ConnectType[K]['args']=>{
        return target === key
    },
    run: async <K extends keyof ConnectType>(key: K, value: any, fun: (a: ConnectType[K]['args'])=>Promise<ConnectType[K]['result']>): Promise<ConnectType[K]['result']>=>{
        return fun(value)
    },
    NO_RESPONSE: 'NO_RESPONSE'
}


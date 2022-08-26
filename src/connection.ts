
import {NotifyPostData} from '@/post_data/notify_post_data';
import {VideoDetailPostData} from '@/post_data/video_detail_post_data';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {BROWSER} from '@/browser';

interface ConnectType  {
    add: { // 通知追加
        args: ValuesNotify,
        result: undefined
    }
    list: { // 通知一覧取得
        args: undefined,
        result: NotifyPostData[]
    }
    edit: { // 通知編集
        args: ValuesNotify,
        result: undefined
    }
    get_notify: { // 編集元通知取得
        args: number, // valueId
        result: ValuesNotify
    }
    remove: { // 通知削除
        args: number, // valueId
        result: undefined
    }
    detail: { // 動画情報取得
        args: number, // valueId
        result: VideoDetailPostData | undefined
    }
    next: { // 次動画遷移
        args: number, // valueId
        result: undefined
    }
    prev: { // 前動画遷移
        args: number, // valueId
        result: undefined
    }
    watch_detail: { // 動画生データ取得
        args: string, // watchId
        result: WatchDetailType
    }
    is_new_notify: { // 新着動画確認
        args: number
        result: boolean
    }
    read_notify: { // 既読
        args: number // valueId
        result: undefined
    }
    reload: {
        args: number // valueId
        result: undefined
    }
}
export default {
    connect: <K extends keyof ConnectType>(key: K, args: ConnectType[K]['args'], resultCallback: (resultValue: ConnectType[K]['result']) => void)=>{
        const port = BROWSER.connect({name: key})
        port.onMessage.addListener(message => {
            resultCallback(message)
            return true
        })
        port.postMessage(args)
    },
    setConnectListener: <K extends keyof ConnectType>(listener: (key: K, args: ConnectType[K]['args'])=>Promise<ConnectType[K]['result']>)=>{
        BROWSER.onConnect.addListener(port => {
            const key = port.name as K
            port.onMessage.addListener(_args =>{
                const args = _args as ConnectType[K]['args']
                listener(key, args).then(result=>{
                    port.postMessage(result)
                })
                return true
            })
        })
    },
    isInstanceof: <K extends keyof ConnectType>(target: K, key: string, value: any)
        : value is ConnectType[K]['args']=>{
        return target === key
    },
    run: async <K extends keyof ConnectType>(key: K, value: any, fun: (a: ConnectType[K]['args'])=>Promise<ConnectType[K]['result']>): Promise<ConnectType[K]['result']>=>{
        return fun(value)
    }
}


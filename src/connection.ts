
import {NotifyPostData} from '@/post_data/notify_post_data';
import {VideoDetailPostData} from '@/post_data/video_detail_post_data';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {BROWSER} from '@/browser';
import {ValuesNotify} from '@/storage/parameters/values_type/values_notify';

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
    // oldConnect: <K extends keyof ConnectType>(key: K, args: ConnectType[K]['args'], resultCallback: (resultValue: ConnectType[K]['result']) => void)=>{
    //     const port = BROWSER.connect({name: key})
    //     port.onMessage.addListener(message => {
    //         resultCallback(message)
    //         return true
    //     })
    //     port.postMessage(args)
    // },
    connect: <K extends keyof ConnectType>(key: K, args?: ConnectType[K]['args']): Promise<ConnectType[K]['result']>=>{
        const port = BROWSER.connect({name: key})
        const p = new Promise<ConnectType[K]['result']>((resolve)=>{
            port.onMessage.addListener(message => {
                resolve(message)
                return true
            })
        })
        port.postMessage(args)
        return p
    },
    setConnectListener: <K extends keyof ConnectType>(listener: (key: K, args: ConnectType[K]['args'])=>Promise<ConnectType[K]['result']>)=>{
        BROWSER.onConnect.addListener(port => {
            const key = port.name as K
            port.onMessage.addListener(_args =>{
                const args = _args as ConnectType[K]['args']
                listener(key, args).then(result=>{
                    // TODO 稀にエラー発生
                    try {
                        port.postMessage(result)
                    }catch (e) {
                        console.warn('key', key)
                        console.warn('args', args)
                        console.warn('port', port)
                        console.warn('result', result)
                        throw e
                    }
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


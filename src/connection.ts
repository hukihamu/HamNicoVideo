
import {NotifyPostData} from '@/post_data/notify_post_data';
import {VideoDetailPostData} from '@/post_data/video_detail_post_data';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {BROWSER} from '@/browser';
import {isInstanceOf} from '@/util';

interface ConnectType  {
    add: {
        args: ValuesNotifySeries,
        result: undefined
    },
    list: {
        args: undefined,
        result: NotifyPostData[]
    },
    remove: {
        args: number, // videoId
        result: undefined
    },
    detail: {
        args: number, // videoId
        result: VideoDetailPostData | undefined
    },
    next: {
        args: number, // videoId
        result: undefined
    },
    prev: {
        args: number, // videoId
        result: undefined
    },
    watch_detail: {
        args: string, // watchId
        result: WatchDetailType
    },
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



import {NotifyPostData} from '@/post_data/notify_post_data';
import {VideoDetailPostData} from '@/post_data/video_detail_post_data';
import {WatchDetailType} from '@/nico_client/watch_detail';

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
        args: string,
        result: undefined
    },
    detail: {
        args: string,
        result: VideoDetailPostData
    },
    next: {
        args: string,
        result: VideoDetailPostData
    },
    prev: {
        args: string,
        result: VideoDetailPostData
    },
    watch_detail: {
        args: string,
        result: WatchDetailType
    }
}
export default {
    connect: <K extends keyof ConnectType>(key: K, args: ConnectType[K]['args'], resultCallback: (resultValue: ConnectType[K]['result'] | undefined) => void)=>{
        const onConnect = ()=>{
            const port = chrome.runtime.connect({name: key})
            port.onMessage.addListener(message => {
                resultCallback(message)
                return true
            })
            port.postMessage(args)
        }
        navigator.serviceWorker.getRegistrations().then((res) => {
            for (let worker of res) {
                console.log(worker)
                if (worker.active.scriptURL.includes('background.js')) {
                    // onConnect()
                    return
                }
            }
        })
    },
    setConnectListener: <K extends keyof ConnectType>(listener: (key: K, args: ConnectType[K]['args'])=>Promise<ConnectType[K]['result']>)=>{
        chrome.runtime.onConnect.addListener(port => {
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
    isInstanceof: <K extends keyof ConnectType>(target: K, key: string, value: any): value is ConnectType[K]['args'] =>{
        return target === key
    }
}


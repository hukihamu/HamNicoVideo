import storage from '@/storage';
import message from '@/message';

const notifyList: ValuesNotifySeries[] = []


const initBackground = async ()=>{
    await storage.init()
    message.setListener(args => {
        if (message.isInstanceof(args, 'add')){
            notifyList.push(args.args)
            return
        }else if (message.isInstanceof(args, 'list')){
            return notifyList
        }else if (message.isInstanceof(args, 'remove')){
            // TODO
        }
    })
}

chrome.runtime.onInstalled.addListener(initBackground)
chrome.runtime.onStartup.addListener(initBackground)



import storage from '@/storage';
import message from '@/message';

const notifyList: unknown[] = []


const initBackground = async ()=>{
    await storage.init()
    message.setListener(args => {
        switch (args.key) {
            case 'add': {
                // TODO
                notifyList.push(args.value)
                return
            }
            case 'list':{
                // TODO
                return notifyList
            }
        }
    })
}

chrome.runtime.onInstalled.addListener(initBackground)
chrome.runtime.onStartup.addListener(initBackground)



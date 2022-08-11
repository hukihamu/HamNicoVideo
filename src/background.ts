import storage from '@/storage';
import MessageSender = chrome.runtime.MessageSender;
interface Massage {
    key: string
    value: unknown
}

const onMassage = (message: Massage, _: MessageSender, sendResponse: (response?: any) => void)=>{
    
}


const initBackground = async ()=>{
    await storage.init()
    chrome.runtime.onMessage.addListener(onMassage)
}

chrome.runtime.onInstalled.addListener(initBackground)
chrome.runtime.onStartup.addListener(initBackground)
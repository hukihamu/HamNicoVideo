import Tab = chrome.tabs.Tab;

export const BROWSER = {
    storage: chrome.storage,
    tabs: {
        query: async (queryInfo: chrome.tabs.QueryInfo): Promise<Tab[]> => {
            return new Promise((resolve)=>{
                chrome.tabs.query(queryInfo, (result)=>{
                    resolve(result)
                })
            })
        }
    },
    onConnect: chrome.runtime.onConnect,
    connect: chrome.runtime.connect,
    onStartup: chrome.runtime.onStartup,
    onInstalled: chrome.runtime.onInstalled,
    alarms: chrome.alarms,
}
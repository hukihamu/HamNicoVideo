import Tab = chrome.tabs.Tab;
import * as Process from 'process';

export const BROWSER = {
    storage: {
        sync: {
            get: async (keys: string | string[] | {[key: string]: any} | null): Promise<any>=>{
                return new Promise((resolve)=>{
                    chrome.storage.sync.get(keys, items => resolve(items))
                })
            },
            set: async (items: {[p: string]: any}): Promise<void>=>{
                return new Promise((resolve)=>{
                    chrome.storage.sync.set(items, ()=>{
                        resolve()
                    })
                })
            }
        },
        local: {
            get: async (keys: string | string[] | {[key: string]: any} | null): Promise<any>=>{
                return new Promise((resolve)=>{
                    chrome.storage.local.get(keys, items => resolve(items))
                })
            },
            set: async (items: {[p: string]: any}): Promise<void>=>{
                return new Promise((resolve)=>{
                    chrome.storage.local.set(items, ()=>{
                        resolve()
                    })
                })
            }
        },
        onChanged: chrome.storage.onChanged
    },
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
    alarms: {
        clear: async (name?: string): Promise<void> =>{
            return new Promise(resolve=>{
                chrome.alarms.clear(name,(()=>{
                    resolve()
                }))
            })
        },
        create: chrome.alarms.create,
        onAlarm: chrome.alarms.onAlarm
    },
}
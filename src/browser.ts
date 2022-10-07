import Tab = chrome.tabs.Tab;
import * as Process from 'process';
import AlarmCreateInfo = chrome.alarms.AlarmCreateInfo;
import Alarm = chrome.alarms.Alarm;

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
    setBadgeText: (text: string)=>{
        chrome.browserAction.setBadgeText({text},()=>{})
    },
    alarms: {
        clear: async (name?: string): Promise<void> =>{
            return new Promise(resolve=>{
                chrome.alarms.clear(name,(()=>{
                    resolve()
                }))
            })
        },
        create: (name: string, alarmInfo: AlarmCreateInfo)=>{
            chrome.alarms.create(name, alarmInfo)
        },
        onAlarm: {
            addListener: (callback: (alarm: Alarm) => void)=>{
                chrome.alarms.onAlarm.addListener(callback)
            }
        }
    },
}
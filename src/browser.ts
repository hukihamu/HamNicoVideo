import Tab = chrome.tabs.Tab;
import AlarmCreateInfo = chrome.alarms.AlarmCreateInfo;
import Alarm = chrome.alarms.Alarm;
import {Problem} from 'webpack-cli'
import {makeResolver} from 'ts-loader/dist/resolver'
const isV2 = !!chrome.browserAction
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
            },
            remove: async (keys: string | string[]): Promise<void> => {
                return new Promise(resolve => {
                    chrome.storage.local.remove(keys, () => resolve())
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
    mGetURL: (path: string): string => {
        if (isV2){
            return chrome.extension.getURL(path)
        }else {
            return chrome.runtime.getURL(path)
        }
    },
    onConnect: chrome.runtime.onConnect,
    connect: chrome.runtime.connect,
    onStartup: chrome.runtime.onStartup,
    onInstalled: chrome.runtime.onInstalled,
    mSendMessage: async (request: any) => {
        if (isV2){
            return new Promise(resolve => {
                chrome.runtime.sendMessage(request, response => {
                    resolve(response)
                    return true
                })
            })
        } else {
            return chrome.runtime.sendMessage(request)
        }

    },
    onMessage: chrome.runtime.onMessage,
    mSetBadgeText: (text: string)=>{
        if (isV2){
            chrome.browserAction.setBadgeText({text},()=>{})
        }else {
            chrome.action.setBadgeText({text}).then()
        }
    },
    mGetBadgeText: async (): Promise<string> => {
        if (isV2){
            return new Promise(resolve => {
                chrome.browserAction.getBadgeText({},(it)=>{
                    resolve(it)
                })
            })
        }else {
            return chrome.action.getBadgeText({})
        }
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
import {parameterDefault, ParametersType} from './parameters';

let storage_cache: ParametersType | undefined = undefined
const STORAGE_KEY = "ham-nico-video"
export default class {
    static async init(){
        const localToParameter = (local: any): ParametersType => {
            const temp = {}
            Object.assign(temp, parameterDefault)
            return Object.assign(temp, (local || {}))
        }

        chrome.storage.onChanged.addListener(changes => {
            storage_cache = localToParameter(changes[STORAGE_KEY].newValue)
        })
        return new Promise<void>((resolve) =>{
            chrome.storage.local.get(null,(items) =>{
                storage_cache = localToParameter(items[STORAGE_KEY])
                resolve()
            })
        })
    }
    static get<U extends keyof ParametersType>(key: U): ParametersType[U]  {
        return storage_cache[key]
    }
    static set<U extends keyof ParametersType>(key: U, value: ParametersType[U]) {
        storage_cache[key] = value
        chrome.storage.local.set({[STORAGE_KEY]: storage_cache}).then()
    }
}
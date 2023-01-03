import {parameterDefault, ParametersType} from './parameters';
import {BROWSER} from '@/browser';
import util from '@/util';
import {ParameterTemplateValue} from '@/storage/parameters/parameter_value/parameter_base_value';

let storage_cache: ParametersType | undefined = undefined
const STORAGE_KEY = "ham-nico-video"
type CacheType = 'newNotifyList' | 'cachePostData'
const localToParameter = (local: any): ParametersType => {
    const temp = {}
    Object.assign(temp, parameterDefault)
    return Object.assign(temp, (local || {}))
}
export default class {
    static async init(){
        BROWSER.storage.onChanged.addListener(changes => {
            if (changes[STORAGE_KEY]) storage_cache = changes[STORAGE_KEY].newValue
        })
        return BROWSER.storage.local.get(null).then(items=>{
            storage_cache = items[STORAGE_KEY]
        })
    }
    static get<U extends keyof ParametersType>(key: U): ParametersType[U]  {
        if (!storage_cache) throw 'storageのinitがされていません'
        let param = storage_cache[key] ?? this.default[key]
        if (util.isInstanceOf<ParameterTemplateValue>(param, 'template')){
            const defaultParam = this.default[key] as ParameterTemplateValue
            if (param.config.templateVersion !== defaultParam.config.templateVersion){
                // バージョン不一致なためデフォルトに戻す
                param = defaultParam as ParametersType[U]
                this.set(key, param)
            }else{
                param.template = defaultParam.template as any
            }
        }
        return param
    }
    static set<U extends keyof ParametersType>(key: U, value: ParametersType[U]) {
        if (!storage_cache) throw 'storageのinitがされていません'
        const clone = Object.assign(value)
        if (util.isInstanceOf<ParameterTemplateValue>(clone, 'template')){
            clone.template = {}
        }
        storage_cache[key] = clone
        BROWSER.storage.local.set({[STORAGE_KEY]: storage_cache}).then()
    }
    static async getCache(key: CacheType): Promise<any> {
        return BROWSER.storage.local.get(key).then(it => {
            return it
        })
    }

    static async setCache(key: CacheType, value: any): Promise<void> {
        return BROWSER.storage.local.set({[key]: value})
    }
    static allDefault = ()=> {
        // 手動初期化
        BROWSER.storage.local.set({[STORAGE_KEY]: {}}).then()
        storage_cache = parameterDefault
    }
    static getAll = ()=>storage_cache
    static default = parameterDefault
}
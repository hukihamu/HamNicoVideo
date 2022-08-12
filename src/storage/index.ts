import {parameterDefault, ParametersType} from './parameters';
import {isInstanceOf} from '@/util';
import {ParameterStaticValues} from '@/storage/parameters/parameter_value/parameter_static_values';
import {ParameterSelectValue} from '@/storage/parameters/parameter_value/parameter_select_value';

let storage_cache: ParametersType | undefined = undefined
const STORAGE_KEY = "ham-nico-video"
const localToParameter = (local: any): ParametersType => {
    const temp = {}
    Object.assign(temp, parameterDefault)
    return Object.assign(temp, (local || {}))
}
export default class {
    static async init(){
        chrome.storage.onChanged.addListener(changes => {
            storage_cache = localToParameter(changes[STORAGE_KEY].newValue)
        })
        return new Promise<void>((resolve) =>{
            chrome.storage.sync.get(null,(items) =>{
                storage_cache = localToParameter(items[STORAGE_KEY])
                resolve()
            })
        })
    }
    static get<U extends keyof ParametersType>(key: U): ParametersType[U]  {
        const param = storage_cache[key]
        if (isInstanceOf<ParameterStaticValues<any>>(param, 'templateKey')){
            // TODO valueIdを追加したので、一意の差し替えが可能
            const defaultParams = parameterDefault[key] as ParameterStaticValues<any>

        }else
        // selectの中身が更新された際の対応
        if (isInstanceOf<ParameterSelectValue>(param, 'selectList')){
            const defaultSelectValue = parameterDefault[key] as ParameterSelectValue
            if (JSON.stringify(param.selectList) !== JSON.stringify(defaultSelectValue.selectList)){
                param.selectList = defaultSelectValue.selectList
                param.selectIndex = defaultSelectValue.selectIndex
            }
        }

        return param
    }
    static set<U extends keyof ParametersType>(key: U, value: ParametersType[U]) {
        storage_cache[key] = value
        chrome.storage.sync.set({[STORAGE_KEY]: storage_cache}).then()
    }
    static allDefault = ()=>{
        // 手動初期化
        chrome.storage.sync.set({[STORAGE_KEY]: {}}).then()
        storage_cache = parameterDefault
    }
    static default = parameterDefault
}
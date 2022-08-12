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
        if (isInstanceOf<ParameterStaticValues<any, any>>(param, 'templateKey')){
            const defaultParam = parameterDefault[key] as ParameterStaticValues<any, any>
            const addKeys = Object.keys(defaultParam.values)
            const removeKeys = []
            const values: any = param.values
            let valuesKey: any
            for (valuesKey in values){
                const index = addKeys.findIndex(v => v === valuesKey)
                if (index === -1) {
                    //defaultに存在しないため、削除
                    removeKeys.push(valuesKey)
                }else {
                    //defaultに存在したため、addしない
                    addKeys.splice(index,1)

                    //templateの変更
                    const value = values[valuesKey]
                    const defaultValue = defaultParam.values[valuesKey]
                    param.templateKey.forEach(templateKey=> value[templateKey] = defaultValue[templateKey])
                }
            }
            removeKeys.forEach(k =>{
                delete values[k]
            })
            addKeys.forEach(k=>{
                values[k] = defaultParam.values[k]
            })
        }else
        // selectの中身が更新された際の対応
        if (isInstanceOf<ParameterSelectValue>(param, 'selectList')){
            const defaultSelectValue = parameterDefault[key] as ParameterSelectValue
            param.selectList = defaultSelectValue.selectList
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
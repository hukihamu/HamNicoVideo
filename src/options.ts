import storage from '@/storage';
import {ParametersType,} from '@/storage/parameters';
import {
    isArrayOf,
    isInstanceOf,
    isInstancesOf,
    objectToKeyArray
} from '@/util';
import {ValuesHighLight} from '@/storage/parameters/values_type/values_high_light';
import {ValuesCheckBox} from '@/storage/parameters/values_type/values_check_box';
// TODO 見た目を洗練
const parameterToName = {
    Video: "動画",
    Watch: "視聴画面",
    MinimizeLike: 'いいねボタン大きさ変更',
    RemoveWatchLater: '後で見るから削除ボタン追加',
    ChangeVideoList: '後で見るリストを表示するリンク追加',
    MyPage: 'マイページ画面',
    HideSideBar: '左サイドバーの最小化',
    HiddenFilter: '非表示フィルター',
    Highlight: 'ハイライト',
    AddWatchLater: '後で見るボタン追加',
    SlimItem: '表示アイテム小型化',
    HighlightNewRange: '新着対象時間',
    OneClickMyList: '1クリックマイリスト'
} as { [key: string]: string }

const onSave = <U extends keyof ParametersType>(key: U, newValue:ParametersType[U])=>{
    const p = storage.get(key)
    storage.set(key, newValue)
    document.getElementById('save').classList.add('is-show')
}
const setEvent = ()=>{
    const saveElement = document.getElementById('save')
    saveElement.addEventListener('animationend', ()=>{
        saveElement.classList.remove('is-show')
    })

    document.getElementById('export').addEventListener('click', ()=>{
        // TODO
        // const e = new Blob([JSON.stringify(BStorage.cache)])
        // const date = new Date()
        // const t = `HamNicoVideo ${date.toLocaleString('ja-JP')}.json`
        // const o = document.createElement('a')
        // o.href = 'string' == typeof e ? e : URL.createObjectURL(e)
        // o.download = t
        // o.dispatchEvent(new MouseEvent('click'))
    })
    document.getElementById('import').addEventListener('click', ()=>{
        document.getElementById('import_input').click()
    })
    document.getElementById('import_input').addEventListener('change', ()=>{
        // TODO
        // const file = e.target.files[0]
        // const t = new FileReader
        // t.addEventListener('load', (() => {
        //     let e
        //     try {
        //         e = JSON.parse(t.result)
        //     } catch (e) {
        //         console.group('Import')
        //         console.error('Failed to read settings file')
        //         console.error(e)
        //         console.groupEnd()
        //         alert('インポートに失敗しました')
        //         return
        //     }
        //     for (const key in BStorage.defaults) {
        //         BStorage.set(key, BStorage.defaults[key])
        //     }
        //     for (const key in e) {
        //         BStorage.set(key, e[key])
        //     }
        //     alert('インポートしました')
        //     window.location.reload()
        // }))
        // t.readAsText(file)
    })
    document.getElementById('all_default').addEventListener('click',()=>{
        storage.allDefault()
        location.reload()
    })
}
const createBody = ()=> {
    //階層作成
    const keys = objectToKeyArray(storage.default)
    type Layer = { [name: string]: keyof ParametersType | Layer }
    const layer: Layer = {}
    keys.forEach(key => {
        let tempLayer: Layer = layer
        key.split('_').forEach((value, index, array) => {
            if (index === array.length - 1) {
                //ラスト
                tempLayer[value] = key
            } else {
                if (!tempLayer[value]) tempLayer[value] = {}
                tempLayer = tempLayer[value] as Layer
            }
        })
    })

    // 階層をもとにhtml作成
    const ul = document.getElementById('main')
    const createLayer = (layer: Layer, level: number) => {
        for (const l in layer) {
            const li = document.createElement('li')
            ul.appendChild(li)
            const childLayer = layer[l]
            if (typeof childLayer === "string") {
                li.className = 'param-content'
                li.id = childLayer
                createOptionGrid(li, childLayer, parameterToName[l] || l)
            } else {
                const header = document.createElement('h' + level)
                header.textContent = parameterToName[l] || l
                li.appendChild(header)
                createLayer(childLayer, level + 1)
            }
        }
    }
    createLayer(layer, 1)
}
const createOptionGrid = (flexParent: HTMLLIElement, key: keyof ParametersType, name: string) =>{
    const param = storage.get(key)
    // 設定の有効無効
    const enableDiv = document.createElement('div')
    const enableCheckBox = document.createElement('input')
    enableCheckBox.type = 'checkbox'
    enableCheckBox.id = key + '-enable'
    enableCheckBox.addEventListener('change', ()=>{
        param.enable = enableCheckBox.checked
        onSave(key,param)
    })
    enableCheckBox.checked = param.enable
    enableDiv.appendChild(enableCheckBox)
    flexParent.appendChild(enableDiv)

    // 設定名
    const paramName = document.createElement('label')
    paramName.textContent = name
    paramName.htmlFor = key + '-enable'
    flexParent.appendChild(paramName)

    // ParameterSelectValue
    if ('selectIndex' in param){

        const select = document.createElement('select')
        select.addEventListener('change', ()=>{
            param.selectIndex = select.selectedIndex
            onSave(key, param)
        })
        flexParent.appendChild(select)
        param.selectList.forEach((value, index) => {
            const option = document.createElement('option')
            option.value = index.toString()
            option.textContent = value.name
            option.selected = index === param.selectIndex
            select.appendChild(option)
        })
    }
    //ParameterTextValue
    else if ('textValue' in param){
        const textInput = document.createElement('input')
        flexParent.appendChild(textInput)
        textInput.value = param.textValue
        console.log(param.textValue)
        textInput.addEventListener('change', ()=>{
            param.textValue = textInput.value
            onSave(key, param)
        })
    }
    // ParameterListValue
    else if ('values' in param){
        paramName.classList.add('bold')
        const valuesUl = document.createElement('ul')
        flexParent.appendChild(valuesUl)
        for (const value of param.values){
            const valueLi = document.createElement('li')
            valueLi.className = 'values-content'
            valuesUl.appendChild(valueLi)
            // ValuesCheckBox
            if(isInstancesOf<ValuesCheckBox<any>>(value, 'name', 'enable')){
                const valueEnableCheckBox = document.createElement('input')
                valueEnableCheckBox.type = 'checkbox'
                valueEnableCheckBox.id = key + '-' + value.valueId + '-enable'
                valueEnableCheckBox.addEventListener('change',()=>{
                    value.enable = valueEnableCheckBox.checked
                    onSave(key, param)
                })
                valueEnableCheckBox.checked = value.enable
                valueLi.appendChild(valueEnableCheckBox)
                const valueName = document.createElement('label')
                valueName.textContent = value.name
                valueName.htmlFor = key + '-' + value.valueId + '-enable'
                valueLi.appendChild(valueName)

                // ValuesHighLight
                if (isInstancesOf<ValuesHighLight>(value, 'color', 'matcher')){
                    const color = value.color.substring(0,7)
                    const alpha = value.color.substring(7,10)

                    const sampleDiv = document.createElement('div')
                    sampleDiv.className = 'color-sample'
                    valueLi.appendChild(sampleDiv)
                    const sampleText = document.createElement('div')
                    sampleText.textContent = value.matcher
                    sampleDiv.appendChild(sampleText)

                    const valueColor = document.createElement('input')
                    valueColor.type = 'color'
                    valueColor.style.width = '25px'
                    valueColor.value = color
                    valueLi.appendChild(valueColor)
                    const valueAlpha = document.createElement('input')
                    valueAlpha.type = 'text'
                    valueAlpha.maxLength = 2
                    valueAlpha.style.width = '25px'
                    valueAlpha.pattern = /[0-9A-Fa-f]{2}/.source
                    valueAlpha.value = alpha
                    valueLi.appendChild(valueAlpha)

                    const onApplySample = ()=>{
                        sampleText.style.backgroundColor = valueColor.value + valueAlpha.value
                    }
                    const changeColor = ()=>{
                        value.color = valueColor.value + valueAlpha.value
                        onSave(key, param)
                        onApplySample()
                    }
                    valueColor.addEventListener('change',changeColor)
                    valueAlpha.addEventListener('change',changeColor)
                    onApplySample()
                }
            }
        }
    }

    //default復元
    const defaultDiv = document.createElement('div')
    defaultDiv.className = 'default'
    flexParent.appendChild(defaultDiv)
    const defaultButton = document.createElement('button')
    defaultButton.textContent = 'default'
    defaultButton.addEventListener('click', ()=>{
        onSave(key, storage.default[key])
        location.reload() // TODO 気に食わないが、しゃーない
    })
    defaultDiv.appendChild(defaultButton)
}

const initOption = async ()=>{
    await storage.init()
    createBody()
    setEvent()
}

document.addEventListener('DOMContentLoaded', initOption, true)
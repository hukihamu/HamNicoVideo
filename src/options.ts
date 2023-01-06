import storage from '@/storage';
import {ValuesHighLight} from '@/storage/parameters/values_type/values_high_light';
import {ValuesCheckBox} from '@/storage/parameters/values_type/values_check_box';
import util from '@/util';
import {ParametersType} from '@/storage/parameters';
import {ParameterSelectValue} from '@/storage/parameters/parameter_value/parameter_select_value';
import {ParameterTextValue} from '@/storage/parameters/parameter_value/parameter_text_value';
import {ParameterStaticValues} from '@/storage/parameters/parameter_value/parameter_static_values';
import {BROWSER} from '@/browser'

const parameterToName = {
    Video: "動画",
    Watch: "視聴画面",
    Notify: '通知',
    NotifyList: '通知一覧',
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
    storage.set(key, newValue)
    document.getElementById('save')?.classList.add('is-show')
}
const setEvent = ()=>{
    const saveElement = document.getElementById('save')
    saveElement?.addEventListener('animationend', ()=>{
        saveElement.classList.remove('is-show')
    })

    document.getElementById('export')?.addEventListener('click', ()=>{
        const e = new Blob([JSON.stringify(storage.getAll())])
        const date = new Date()
        const t = `HamNicoVideo ${date.toLocaleString('ja-JP')}.json`
        const o = document.createElement('a')
        o.href = URL.createObjectURL(e)
        o.download = t
        o.dispatchEvent(new MouseEvent('click'))
        o.remove()
    })
    document.getElementById('import')?.addEventListener('click', ()=>{
        document.getElementById('import_input')?.click()
    })
    document.getElementById('import_input')?.addEventListener('change', (e)=>{
        const target = e.target
        if (target){
            try {
                const file = ((target as HTMLInputElement).files ?? [])[0]
                const fReader = new FileReader()
                fReader.addEventListener('load', () => {
                    const json = JSON.parse(fReader.result as string)
                    if (json['video/repo/add_watch_later']){
                        // 旧式設定
                        alert('設定情報が旧式だったため、インポートを中断しました。')
                    }else {
                        storage.setAll(json)
                    }
                })
                alert('インポートしました')
                location.reload()
                fReader.readAsText(file)
            }catch (e) {
                alert('インポートに失敗しました')
            }
        }
    })
    document.getElementById('all_default')?.addEventListener('click',()=>{
        storage.allDefault()
        location.reload()
    })
    document.getElementById('old_option')?.addEventListener('click', () => {
        alert('現バージョンで使用していない旧バージョンの設定を表示します。\n設定の引き継ぎにご利用ください。\n(互換性対応に力尽きました)')
        window.open(BROWSER.mGetURL('/html/old_option.html'), '_blank')
    })
}
const createBody = ()=> {
    //階層作成
    const keys = util.objectToKeyArray(storage.default)
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
            ul?.appendChild(li)
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
        param.config.enable = enableCheckBox.checked
        onSave(key,param)
    })
    enableCheckBox.checked = param.config.enable
    enableDiv.appendChild(enableCheckBox)
    flexParent.appendChild(enableDiv)

    // 設定名
    const paramName = document.createElement('label')
    paramName.textContent = name
    paramName.htmlFor = key + '-enable'
    flexParent.appendChild(paramName)

    // ParameterSelectValue
    if (util.isInstancesParamBaseOf<ParameterSelectValue>(param, 'selectIndex')){
        const select = document.createElement('select')
        select.addEventListener('change', ()=>{
            param.config.selectIndex = select.selectedIndex
            onSave(key, param)
        })
        flexParent.appendChild(select)
        param.template.selectList.forEach((value, index) => {
            const option = document.createElement('option')
            option.value = index.toString()
            option.textContent = value.name
            option.selected = index === param.config.selectIndex
            select.appendChild(option)
        })
    }//ParameterTextValue
    else if (util.isInstancesParamBaseOf<ParameterTextValue>(param, 'textValue')){

        const textInput = document.createElement('input')
        flexParent.appendChild(textInput)
        textInput.value = param.config.textValue
        textInput.addEventListener('change', ()=>{
            param.config.textValue = textInput.value
            onSave(key, param)
        })
    } // ParameterListValue
    else if (util.isInstancesParamBaseOf<ParameterStaticValues<any, any>>(param, 'values')){
        paramName.classList.add('bold')
        const valuesUl = document.createElement('ul')
        flexParent.appendChild(valuesUl)
        util.forParamValues<ValuesTemplate<any>>(param, (value)=>{
            const valueLi = document.createElement('li')
            valueLi.className = 'values-content'
            valuesUl.appendChild(valueLi)
            // ValuesCheckBox
            if(util.isInstancesValuesTemplateOf<ValuesCheckBox<any>>(value, ['enable'])){
                const valueEnableCheckBox = document.createElement('input')
                valueEnableCheckBox.type = 'checkbox'
                valueEnableCheckBox.id = key + '-' + value.config.valueId + '-enable'
                valueEnableCheckBox.addEventListener('change',()=>{
                    value.config.enable = valueEnableCheckBox.checked
                    onSave(key, param)
                })
                valueEnableCheckBox.checked = value.config.enable
                valueLi.appendChild(valueEnableCheckBox)
                const valueName = document.createElement('label')
                valueName.textContent = value.template.name
                valueName.htmlFor = key + '-' + value.config.valueId + '-enable'
                valueLi.appendChild(valueName)

                // ValuesHighLight
                if (util.isInstancesValuesTemplateOf<ValuesHighLight>(value, ['color'])){
                    const color = value.config.color.substring(0,7)
                    const alpha = value.config.color.substring(7,10)

                    const sampleDiv = document.createElement('div')
                    sampleDiv.className = 'color-sample'
                    valueLi.appendChild(sampleDiv)
                    const sampleText = document.createElement('div')
                    sampleText.textContent = value.template.matcher
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
                        value.config.color = valueColor.value + valueAlpha.value
                        onSave(key, param)
                        onApplySample()
                    }
                    valueColor.addEventListener('change',changeColor)
                    valueAlpha.addEventListener('change',changeColor)
                    onApplySample()
                }
            }
        })
    }

    //個別default復元
    const defaultDiv = document.createElement('div')
    defaultDiv.className = 'default'
    flexParent.appendChild(defaultDiv)
    const defaultButton = document.createElement('button')
    defaultButton.textContent = 'default'
    defaultButton.addEventListener('click', ()=>{
        onSave(key, storage.default[key])
        // 手動で戻すくらいなら、リロードして生成し直す TODO 良いフローがあれば治す
        location.reload()
    })
    defaultDiv.appendChild(defaultButton)
}

const initOption = async ()=>{
    await storage.init()
    createBody()
    setEvent()
}

document.addEventListener('DOMContentLoaded', initOption, true)
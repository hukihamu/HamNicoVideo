const lang = {
    NICOREPO: "ニコレポ",
    nicorepo_highlight: "強調表示",
    nicorepo_highlight_like: "いいね！",
    nicorepo_highlight_ad: "ニコニ広告",
    nicorepo_highlight_live: "生放送",
    nicorepo_highlight_kiriban: "キリ番",
    nicorepo_highlight_mylist: "マイリスト",
    nicorepo_highlight_add_video: "投稿",
    nicorepo_filter: "フィルター",
    nicorepo_filter_like: "いいね！",
    nicorepo_filter_ad: "ニコニ広告",
    nicorepo_filter_live: "生放送",
    nicorepo_filter_kiriban: "キリ番",
    nicorepo_filter_mylist: "マイリスト",
    nicorepo_filter_add_video: "投稿",
}


function save(event) {
    ChromeStorage.set(event.target.id,event.target.checked)
    const saveElement = document.getElementById('save')
    saveElement.classList.add('is-show')
    //alert('保存しました') TODO
}

function createOptionParamElement(optionParam) {
    let element
    const label = document.createElement('label')
    const text = lang[optionParam.key]
    label.innerHTML += text === undefined ? optionParam.key : text

    switch (typeof optionParam.default){
        case 'boolean':
            element = document.createElement('input')
            element.type = 'checkbox'
            element.checked = ChromeStorage.get(optionParam.key)
            label.onchange = save
            break
        default:
            element = document.createElement('input')
            element.type = 'text'
            element.value = ChromeStorage.get(optionParam.key)
            break
    }
    element.id = optionParam.key
    element.className = 'option'
    label.appendChild(element)
    return label
}

function insertOptionElement(parent,options,headNumber) {
    if (options instanceof OptionParam) {
        const element = createOptionParamElement(options)
        parent.appendChild(element)
    } else{
        headNumber++
        for (let key in options){
            const value = options[key]

            const div = document.createElement('ul')
            if (!(value instanceof OptionParam)){
                const head = document.createElement('h'+headNumber)
                head.innerText = key
                div.appendChild(head)
            }
            insertOptionElement(div,value, headNumber)
            parent.appendChild(div)

        }

    }
}

const options = async function () {
    await ChromeStorage.init()

    insertOptionElement(document.getElementById('option-main'),OPTION_PARAM,1)
    /*
    const keys = ChromeStorage.keys()
    for (let i = 0;i < keys.length; i++){
        const key = keys[i]
        const element = document.getElementById(key)
        element.checked = ChromeStorage.get(key)
        element.addEventListener('change',save)
    }
     */
    const saveElement = document.getElementById('save')
    saveElement.onanimationend = ()=>{
        saveElement.classList.remove('is-show')
    }
}
document.addEventListener("DOMContentLoaded", options);

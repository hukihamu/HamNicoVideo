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
    NICOVIDEO: "ニコニコ動画",
    nicovideo_hide_watchlater: "「後で見る」非表示",
    nicovideo_hide_share: "共有ボタン(twitter,facebook,line)非表示",
    nicovideo_comment_tooltip: "コメントツールチップ置き換え(見やすくしました)",
    CUSTOM_MYLIST: "カスタムマイリスト(1クリックで選択したマイリストに保存される機能)",
    nicovideo_custom_mylist_id: "カスタムマイリストID(マイリストURL末尾の数字)",
    SHOW: "サイドバー最小化(タイトルクリックで最大化されます)",
    nicorepo_show_types: "「タイプ」",
    nicorepo_show_target: "「表示対象」",
    nicorepo_show_filter: "「フィルター」",
    PLAYER_STATUS: "プレイヤー状態　(動画プレイヤー移動時に固定値適用　※動画ページ内遷移は適用外)",
    nicovideo_player_status_hold_playback_rate: "再生速度を「1」に固定",
    nicovideo_player_status_hold_panel_state: "プレイヤーパネルを「コメントリスト」に固定",
    nicovideo_player_status_hold_is_not_continuous: "自動再生を「off」に固定",
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
    label.innerText += text === undefined ? optionParam.key : text

    if (optionParam instanceof SelectOptionParam){
        element = document.createElement('select')
        const selectedValue = ChromeStorage.get(optionParam.key)
        for (let i = 0; i < optionParam.options.length;i++) {
            const option = optionParam.options[i]
            const optElm = document.createElement('option')
            optElm.value = i
            optElm.text = option
            optElm.selected = i === selectedValue
            element.appendChild(optElm)
        }
    }else switch (typeof optionParam.default){
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

                const text = lang[key]
                head.innerText = text === undefined ? key : text
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

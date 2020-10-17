//初期値　＆　Key取得しやすく
class OptionParam{
    constructor(_key,_default) {
        this.key = _key
        this.default = _default
    }
    get param(){
        return  ChromeStorage.get(this.key)
    }
    set param(value){
        return  ChromeStorage.set(this.key,value)
    }
}
//セレクトタグ用
class SelectOptionParam extends OptionParam{
    constructor(_key,_default,_options) {
        super(_key,_default);
        this.options = _options
    }

}
class MatchOptionParam extends OptionParam{
    constructor(_key,_default,_match) {
        super(_key,_default,);
        this.match = _match
    }
}
//Filter用
class FilterOptionParam extends MatchOptionParam{
    constructor(_key,_default,_match,_text) {
        super(_key,_default,_match);
        this.text = _text
    }

    createCheckBox(_applyFilter){
        const subMenuItem = document.createElement("li")
        subMenuItem.className = "SubMenuLink NicorepoPageSubMenu-subMenuItem"
        const subMenuItemLink = document.createElement("a")
        subMenuItemLink.className = "SubMenuLink-link SubMenuLink-link_internal"

        const checkBox = document.createElement("input")
        checkBox.type = "checkbox"
        checkBox.className = "SubMenuLink-icon"
        const f = this
        subMenuItemLink.addEventListener('click',function(event){
            if(event.target.nodeName!=='INPUT'){
                checkBox.checked = !checkBox.checked
            }
            ChromeStorage.set(f.key,checkBox.checked)
            _applyFilter()
        },false)
        checkBox.checked = ChromeStorage.get(this.key)

        const label = document.createElement("span")
        label.className = "SubMenuLink-label"
        label.innerHTML = this.text
        subMenuItemLink.appendChild(checkBox)
        subMenuItemLink.appendChild(label)
        subMenuItem.appendChild(subMenuItemLink)
        return subMenuItem
    }
}

//定数
const OPTION_PARAM = {
    NICOREPO :{
        HIGHLIGHT:{
            IS_HIGHLIGHT: new OptionParam('nicorepo_highlight',true),
            VALUE_HIGHLIGHT: {
                LIKE: new MatchOptionParam('nicorepo_highlight_like', '#a5d17814', '^動画を「いいね！」しました$'),
                AD: new MatchOptionParam('nicorepo_highlight_ad', '#FFFFFF', '^ニコニ広告しました'),
                LIVE: new MatchOptionParam('nicorepo_highlight_live', '#FFFFFF', '生放送を開始しました$'),
                KIRIBAN: new MatchOptionParam('nicorepo_highlight_kiriban', '#FFFFFF', '再生を達成しました$'),
                MYLIST: new MatchOptionParam('nicorepo_highlight_mylist', '#76b3f914', '^マイリスト'),
                ADD_VIDEO: new MatchOptionParam('nicorepo_highlight_add_video', '#d0021b14', '投稿しました$|^動画を登録しました$'),
            }
        },
        FILTER: {
            IS_FILTER: new OptionParam('nicorepo_filter',true),
            VALUE_FILTER: {
                LIKE: new FilterOptionParam('nicorepo_filter_like',false,'^動画を「いいね！」しました$','いいね！'),
                AD: new FilterOptionParam('nicorepo_filter_ad',false,'^ニコニ広告しました', '広告'),
                LIVE: new FilterOptionParam('nicorepo_filter_live',false,'生放送を開始しました$', '生放送'),
                KIRIBAN: new FilterOptionParam('nicorepo_filter_kiriban',false,'再生を達成しました$', 'キリ番'),
                MYLIST: new FilterOptionParam('nicorepo_filter_mylist',false,'^マイリスト','マイリスト'),
                ADD_VIDEO: new FilterOptionParam('nicorepo_filter_add_video',false,'投稿しました$|^動画を登録しました$','動画投稿'),
            }
        },
        SHOW: {
            SHOW_TYPES: new OptionParam('nicorepo_show_types',true),
            SHOW_TARGET: new OptionParam('nicorepo_show_target',true),
            SHOW_FILTER: new OptionParam('nicorepo_show_filter',true),
        },
    },
    NICOVIDEO: {
        HIDE_WATCHLATER: new OptionParam('nicovideo_hide_watchlater',true),
        HIDE_SHARE: new OptionParam('nicovideo_hide_share',true),
        COMMENT_TOOLTIP: new OptionParam('nicovideo_comment_tooltip',true),
        CUSTOM_MYLIST: {
            VALUE_CUSTOM_MYLIST: new OptionParam('nicovideo_custom_mylist_id',-1)
        },
        // HOLD_PLAYBACK_RATE:{
        //     SELECT_HOLD_PLAYBACK_RATE: new SelectOptionParam('nicovideo_select_hold_playback_rate',1,['無効','連続再生時以外有効','有効']),
        //     PLAYBACK_RATE: new OptionParam('nicovideo_playback_rate',1)
        // },
    }
}
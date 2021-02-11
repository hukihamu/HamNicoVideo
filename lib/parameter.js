class PValue {
    constructor(_key, _default) {
        this.key = _key
        this.default = _default
    }

    get pValue() {
        return BStorage.get(this.key)
    }

    set pValue(value) {
        return BStorage.set(this.key, value)
    }

    get input() {
        let input = document.createElement('input')
        const p = this
        let onChange = function (e) {
            p.pValue = e.target.value
            showSave()
        }
        switch (typeof this.default) {
            case 'boolean': {
                input.type = 'checkbox'
                input.checked = p.pValue
                onChange = function (e) {
                    p.pValue = e.target.checked
                    showSave()
                }
                break
            }
            case 'string': {
                if (this.default.match('^#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')) {
                    input.dataset.jscolor = '{}'
                    input.value = p.pValue
                }
                break
            }
            case 'number': {
                if (p instanceof SelectPValue){
                    input = document.createElement('select')
                    const options = p.options
                    for (let i = 0; i < options.length;i++){
                        const o = document.createElement('option')
                        o.value = i
                        o.text = options[i].name
                        input.appendChild(o)
                    }
                    input.value = p.pValue
                    break
                }else {
                    input.type = 'number'
                    input.value = p.pValue
                    break
                }
            }
            default: {
                input.type = 'text'
                input.value = p.pValue
                break
            }
        }
        input.id = p.key
        input.addEventListener('change', onChange)
        return input
    }
}
class SelectPValue extends PValue{
    constructor(_key, _default, _options) {
        super(_key,_default)
        this.options = _options
    }
}
const HOLD_SETTING_OPTIONS = [
    {
        name: '固定しない',
        value: 'none'
    },
    {
        name: '同じページ内のみ固定しない',
        value: 'page'
    },
    {
        name: '「次の動画」遷移時のみ固定しない',
        value: 'next'
    },
    {
        name: 'すべての動画で固定',
        value: 'all'
    }
]
const PLAYBACK_RATE_VALUES = [
    {name: '0.25', value: '0.25'},
    {name: '0.5', value: '0.5'},
    {name: '0.75', value: '0.75'},
    {name: '1', value: '1'},
    {name: '1.25', value: '1.25'},
    {name: '1.75', value: '1.75'},
    {name: '2', value: '2'},
]
const PLAYER_CONTROLLER_VALUES = [
    {name: 'コメントリスト', value: '\"comment_list\"'},
    {name: '動画リスト', value: '\"video_list\"'},
]


class MatcherPValue extends PValue {
    constructor(_key, _default, _matcher) {
        super(_key, _default)
        this.matcher = _matcher
    }

    static elementMatchText(text, object) {
        const filters = Object.values(object)
        for (let i = 0; i < filters.length; i++) {
            const element = filters[i]
            if (element instanceof MatcherPValue && text.match(element.matcher) !== null) {
                return element
            }
        }
        return null
    }
}

const PARAMETER_TEXT = {
    video_repo_filter_ad: 'ニコニ広告',
    video_repo_filter_like: 'いいね!',
    video_repo_filter_kiri: 'キリバン',
    video_repo_filter_my_list: 'マイリスト',
    video_repo_filter_live: '生放送',
    video_repo_filter_video: '動画',
    video_repo_filter_image: '静画',
    video_repo_filter_blog: 'ブロマガ',
    video_repo_filter_manga: 'マンガ',
    video_repo_filter_model: 'ニコニ立体',
}
const PARAMETER_TITLE = {
    VIDEO: 'ニコニコ動画',
    REPO: 'ニコレポ',
    CUSTOM_LAYOUT: '',
    HIGHLIGHT: '強調表示',
    FILTER: 'フィルター',
    WATCH: '再生画面',
    LIVE: 'ニコニコ生放送',
}
const REPO_TYPE = {
    AD: '^ニコニ広告しました',
    LIKE: '^動画を「いいね！」しました$',
    KIRI: '再生を達成しました$',
    MY_LIST: '^マイリスト',
    LIVE: '生放送',
    LIVE_START: '生放送を開始しました$',
    LIVE_PLAN: '生放送予定です$',
    VIDEO: '^動画を投稿しました$|^動画を登録しました$',
    IMAGE: 'イラスト',
    IMAGE_UP: '^イラストを投稿しました$',
    IMAGE_CLIP: '^イラストをクリップしました$',
    BLOG: '^ブロマガを投稿しました$',
    MANGA: 'マンガ',
    MANGA_UP: 'マンガ',
    MANGA_FAV: 'マンガ',
    MODEL: 'ニコニ立体',
    MODEL_UP: '^ニコニ立体に作品を投稿しました$'
}

const PARAMETER = {
    VIDEO: {
        REPO: {
            CUSTOM_LAYOUT: {
                ENABLE: new PValue('video_repo_custom_layout_enable', true),
                HIGHLIGHT: {
                    ENABLE: new PValue('video_repo_custom_layout_highlight_enable', true),
                    AD: new MatcherPValue('video_repo_custom_layout_highlight_ad', '#FFFFFFFF', REPO_TYPE.AD),
                    LIKE: new MatcherPValue('video_repo_custom_layout_highlight_like', '#A5D17814', REPO_TYPE.LIKE),
                    KIRI: new MatcherPValue('video_repo_custom_layout_highlight_kiri', '#FFFFFFFF', REPO_TYPE.KIRI),
                    MY_LIST: new MatcherPValue('video_repo_custom_layout_highlight_my_list', '#76B3F914', REPO_TYPE.MY_LIST),
                    VIDEO: new MatcherPValue('video_repo_custom_layout_highlight_video', '#d0021b14', REPO_TYPE.VIDEO),
                    LIVE: new MatcherPValue('video_repo_custom_layout_highlight_live', '#FFFFFFFF', REPO_TYPE.LIVE),
                    IMAGE: new MatcherPValue('video_repo_custom_layout_highlight_image','#FFFFFFFF',REPO_TYPE.IMAGE),
                    BLOG: new MatcherPValue('video_repo_custom_layout_highlight_blog','#FFFFFFFF',REPO_TYPE.BLOG),
                    MANGA: new MatcherPValue('video_repo_custom_layout_highlight_manga','#FFFFFFFF',REPO_TYPE.MANGA),
                    MODEL: new MatcherPValue('video_repo_custom_layout_highlight_model','#FFFFFFFF',REPO_TYPE.MODEL),
                },
                ADD_WATCH_LATER: new PValue('video_repo_custom_layout_add_watch_later',true)
            },
            FILTER: {
                ENABLE: new PValue('video_repo_filter_enable', true),
                AD: new MatcherPValue('video_repo_filter_ad', false, REPO_TYPE.AD),
                LIKE: new MatcherPValue('video_repo_filter_like', false, REPO_TYPE.LIKE),
                KIRI: new MatcherPValue('video_repo_filter_kiri', false, REPO_TYPE.KIRI),
                MY_LIST: new MatcherPValue('video_repo_filter_my_list', false, REPO_TYPE.MY_LIST),
                LIVE: new MatcherPValue('video_repo_filter_live', false, REPO_TYPE.LIVE),
                // : new MatcherPValue('video_repo_filter_',false,REPO_TYPE.),
                VIDEO: new MatcherPValue('video_repo_filter_video', false, REPO_TYPE.VIDEO),
                IMAGE: new MatcherPValue('video_repo_filter_image',false,REPO_TYPE.IMAGE),
                BLOG: new MatcherPValue('video_repo_filter_blog',false,REPO_TYPE.BLOG),
                MANGA: new MatcherPValue('video_repo_filter_manga',false,REPO_TYPE.MANGA),
                MODEL: new MatcherPValue('video_repo_filter_model',false,REPO_TYPE.MODEL),
            },
            SIDE_FOLD: {
                TYPES: new PValue('video_repo_side_fold_types', true),
                TARGET: new PValue('video_repo_side_fold_target', true),
                FILTER: new PValue('video_repo_side_fold_filter', true),
            }
        },
        WATCH: {
            CUSTOM_MY_LIST: {
                ENABLE: new PValue('video_watch_custom_my_list_enable',true),
                MY_LIST_ID: new PValue('video_watch_custom_my_list_id',-1),
            },
            HIDE_WATCH_LATER: new PValue('video_watch_hide_watch_later',true),
            HOLD_SETTING: {
                ENABLE: new PValue('video_watch_hold_setting_enable',true),
                CONTINUOUS: {
                    ENABLE: new SelectPValue('video_watch_hold_setting_continuous_enable',2,HOLD_SETTING_OPTIONS),
                    HOLD_VALUE: new PValue('video_watch_hold_setting_continuous_hold_value',false)
                },
                PLAYBACK_RATE: {
                    ENABLE: new SelectPValue('video_watch_hold_setting_playback_rate_enable',2,HOLD_SETTING_OPTIONS),
                    HOLD_VALUE: new SelectPValue('video_watch_hold_setting_playback_rate_hold_value',3,PLAYBACK_RATE_VALUES)
                },
                PLAYER_CONTROLLER: {
                    ENABLE: new SelectPValue('video_watch_hold_setting_player_controller_enable',3,HOLD_SETTING_OPTIONS),
                    HOLD_VALUE: new SelectPValue('video_watch_hold_setting_player_controller_hold_value',0,PLAYER_CONTROLLER_VALUES)
                },
            },
            IS_HTTP_VIDEO: new PValue('video_watch_is_http_video',true)
        },
    },
    LIVE: {}
}

//NICOREPO: "ニコレポ",
//     nicorepo_highlight: "強調表示",
//     nicorepo_highlight_like: "いいね！",
//     nicorepo_highlight_ad: "ニコニ広告",
//     nicorepo_highlight_live: "生放送",
//     nicorepo_highlight_kiriban: "キリ番",
//     nicorepo_highlight_mylist: "マイリスト",
//     nicorepo_highlight_add_video: "投稿",
//     nicorepo_filter: "フィルター",
//     nicorepo_filter_like: "いいね！",
//     nicorepo_filter_ad: "ニコニ広告",
//     nicorepo_filter_live: "生放送",
//     nicorepo_filter_kiriban: "キリ番",
//     nicorepo_filter_mylist: "マイリスト",
//     nicorepo_filter_add_video: "投稿",
//     nicovideo_hide_watchlater: "「後で見る」非表示",
//     nicovideo_hide_share: "共有ボタン(twitter,facebook,line)非表示",
//     nicovideo_comment_tooltip: "コメントツールチップ置き換え(見やすくしました)",
//     CUSTOM_MYLIST: "カスタムマイリスト(1クリックで選択したマイリストに保存される機能)",
//     nicovideo_custom_mylist_id: "カスタムマイリストID(マイリストURL末尾の数字)",
//     SHOW: "サイドバー最小化(タイトルクリックで最大化されます)",
//     nicorepo_show_types: "「タイプ」",
//     nicorepo_show_target: "「表示対象」",
//     nicorepo_show_filter: "「フィルター」",
//     PLAYER_STATUS: "プレイヤー状態　(動画プレイヤー移動時に固定値適用　※動画ページ内遷移は適用外)",
//     nicovideo_player_status_hold_playback_rate: "再生速度を「1」に固定",
//     nicovideo_player_status_hold_panel_state: "プレイヤーパネルを「コメントリスト」に固定",
//     nicovideo_player_status_hold_is_not_continuous: "自動再生を「off」に固定",
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
                    input.pattern = '^#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
                }
                break
            }
            case 'number': {
                if (p instanceof SelectPValue) {
                    input = document.createElement('select')
                    const options = p.options
                    for (let i = 0; i < options.length; i++) {
                        const o = document.createElement('option')
                        o.value = i
                        o.text = options[i].name
                        input.appendChild(o)
                    }
                    input.value = p.pValue
                    break
                } else {
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

class SelectPValue extends PValue {
    constructor(_key, _default, _options) {
        super(_key, _default)
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
    'video/repo/filter/ad': 'ニコニ広告',
    'video/repo/filter/like': 'いいね!',
    'video/repo/filter/kiri': 'キリバン',
    'video/repo/filter/my_list': 'マイリスト',
    'video/repo/filter/live': '生放送',
    'video/repo/filter/video': '動画',
    'video/repo/filter/image': '静画',
    'video/repo/filter/blog': 'ブロマガ',
    'video/repo/filter/manga': 'マンガ',
    'video/repo/filter/model': 'ニコニ立体',
    'video/repo/add_watch_later': '「あとで見る」ボタン追加',
    'video/repo/highlight/ad': 'ニコニ広告',
    'video/repo/highlight/like': 'いいね!',
    'video/repo/highlight/kiri': 'キリバン',
    'video/repo/highlight/my_list': 'マイリスト',
    'video/repo/highlight/video': '動画',
    'video/repo/highlight/live': '生放送',
    'video/repo/highlight/image': '静画',
    'video/repo/highlight/blog': 'ブロマガ',
    'video/repo/highlight/manga': 'マンガ',
    'video/repo/highlight/model': 'ニコニ立体',
    'video/repo/side_fold/types': 'タイプ',
    'video/repo/side_fold/target': '優先順位',
    'video/repo/side_fold/filter': 'フィルター',
    'video/watch/custom_my_list/id': 'マイリストID',
    'video/watch/hold_setting/continuous/hold_value': '固定する値',
    'video/watch/hold_setting/playback_rate/hold_value': '固定する値',
    'video/watch/hold_setting/player_controller/hold_value': '固定する値',
    'video/watch/remove_watch_later': '「あとで見る」削除ボタン',
    'video/repo/custom_layout': 'カスタムレイアウト',


}
const PARAMETER_TITLE = {
    VIDEO: 'ニコニコ動画',
    REPO: 'ニコレポ',
    HIGHLIGHT: '強調表示',
    FILTER: '非表示フィルター',
    WATCH: '再生画面',
    LIVE: 'ニコニコ生放送',
    SIDE_FOLD: 'サイドバー最大化',
    CUSTOM_MY_LIST: 'カスタムマイリスト',
    HOLD_SETTING: '設定保持',
    CONTINUOUS: '連続再生',
    PLAYBACK_RATE: '再生速度',
    PLAYER_CONTROLLER: 'プレイヤーパネル'
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
const COMPATIBILITY_PARAMETER_KEY = {
    'video/repo/custom_layout': 'video_repo_custom_layout_enable',
    'video/repo/add_watch_later': 'video_repo_custom_layout_add_watch_later',
    'video/repo/highlight/enable': 'video_repo_custom_layout_highlight_enable',
    'video/repo/highlight/ad': 'video_repo_custom_layout_highlight_ad',
    'video/repo/highlight/like': 'video_repo_custom_layout_highlight_like',
    'video/repo/highlight/kiri': 'video_repo_custom_layout_highlight_kiri',
    'video/repo/highlight/my_list': 'video_repo_custom_layout_highlight_my_list',
    'video/repo/highlight/video': 'video_repo_custom_layout_highlight_video',
    'video/repo/highlight/live': 'video_repo_custom_layout_highlight_live',
    'video/repo/highlight/image': 'video_repo_custom_layout_highlight_image',
    'video/repo/highlight/blog': 'video_repo_custom_layout_highlight_blog',
    'video/repo/highlight/manga': 'video_repo_custom_layout_highlight_manga',
    'video/repo/highlight/model': 'video_repo_custom_layout_highlight_model',
    'video/repo/filter/enable': 'video_repo_filter_enable',
    'video/repo/filter/ad': 'video_repo_filter_ad',
    'video/repo/filter/like': 'video_repo_filter_like',
    'video/repo/filter/kiri': 'video_repo_filter_kiri',
    'video/repo/filter/my_list': 'video_repo_filter_my_list',
    'video/repo/filter/live': 'video_repo_filter_live',
    'video/repo/filter/video': 'video_repo_filter_video',
    'video/repo/filter/image': 'video_repo_filter_image',
    'video/repo/filter/blog': 'video_repo_filter_blog',
    'video/repo/filter/manga': 'video_repo_filter_manga',
    'video/repo/filter/model': 'video_repo_filter_model',
    'video/repo/side_fold/types': 'video_repo_side_fold_types',
    'video/repo/side_fold/target': 'video_repo_side_fold_target',
    'video/repo/side_fold/filter': 'video_repo_side_fold_filter',
    'video/watch/remove_watch_later': 'video_watch_remove_watch_later',
    'video/watch/custom_my_list/enable': 'video_watch_custom_my_list_enable',
    'video/watch/custom_my_list/id': 'video_watch_custom_my_list_id',
    'video/watch/hold_setting/enable': 'video_watch_hold_setting_enable',
    'video/watch/hold_setting/continuous/enable': 'video_watch_hold_setting_continuous_enable',
    'video/watch/hold_setting/continuous/hold_value': 'video_watch_hold_setting_continuous_hold_value',
    'video/watch/hold_setting/playback_rate/enable': 'video_watch_hold_setting_playback_rate_enable',
    'video/watch/hold_setting/playback_rate/hold_value': 'video_watch_hold_setting_playback_rate_hold_value',
    'video/watch/hold_setting/player_controller/enable': 'video_watch_hold_setting_player_controller_enable',
    'video/watch/hold_setting/player_controller/hold_value': 'video_watch_hold_setting_player_controller_hold_value'
}

const PARAMETER = {
    VIDEO: {
        REPO: {
            CUSTOM_LAYOUT: new PValue('video/repo/custom_layout', true),
            ADD_WATCH_LATER: new PValue('video/repo/add_watch_later', true),
            HIGHLIGHT: {
                ENABLE: new PValue('video/repo/highlight/enable', true),
                AD: new MatcherPValue('video/repo/highlight/ad', '#FFFFFFFF', REPO_TYPE.AD),
                LIKE: new MatcherPValue('video/repo/highlight/like', '#A5D17814', REPO_TYPE.LIKE),
                KIRI: new MatcherPValue('video/repo/highlight/kiri', '#FFFFFFFF', REPO_TYPE.KIRI),
                MY_LIST: new MatcherPValue('video/repo/highlight/my_list', '#76B3F914', REPO_TYPE.MY_LIST),
                VIDEO: new MatcherPValue('video/repo/highlight/video', '#d0021b14', REPO_TYPE.VIDEO),
                LIVE: new MatcherPValue('video/repo/highlight/live', '#FFFFFFFF', REPO_TYPE.LIVE),
                IMAGE: new MatcherPValue('video/repo/highlight/image', '#FFFFFFFF', REPO_TYPE.IMAGE),
                BLOG: new MatcherPValue('video/repo/highlight/blog', '#FFFFFFFF', REPO_TYPE.BLOG),
                MANGA: new MatcherPValue('video/repo/highlight/manga', '#FFFFFFFF', REPO_TYPE.MANGA),
                MODEL: new MatcherPValue('video/repo/highlight/model', '#FFFFFFFF', REPO_TYPE.MODEL),
            },
            FILTER: {
                ENABLE: new PValue('video/repo/filter/enable', true),
                AD: new MatcherPValue('video/repo/filter/ad', false, REPO_TYPE.AD),
                LIKE: new MatcherPValue('video/repo/filter/like', false, REPO_TYPE.LIKE),
                KIRI: new MatcherPValue('video/repo/filter/kiri', false, REPO_TYPE.KIRI),
                MY_LIST: new MatcherPValue('video/repo/filter/my_list', false, REPO_TYPE.MY_LIST),
                LIVE: new MatcherPValue('video/repo/filter/live', false, REPO_TYPE.LIVE),
                VIDEO: new MatcherPValue('video/repo/filter/video', false, REPO_TYPE.VIDEO),
                IMAGE: new MatcherPValue('video/repo/filter/image', false, REPO_TYPE.IMAGE),
                BLOG: new MatcherPValue('video/repo/filter/blog', false, REPO_TYPE.BLOG),
                MANGA: new MatcherPValue('video/repo/filter/manga', false, REPO_TYPE.MANGA),
                MODEL: new MatcherPValue('video/repo/filter/model', false, REPO_TYPE.MODEL),
            },
            SIDE_FOLD: {
                TYPES: new PValue('video/repo/side_fold/types', true),
                TARGET: new PValue('video/repo/side_fold/target', true),
                FILTER: new PValue('video/repo/side_fold/filter', true),
            }
        },
        WATCH: {
            REMOVE_WATCH_LATER: new PValue('video/watch/remove_watch_later', true),

            CUSTOM_MY_LIST: {
                ENABLE: new PValue('video/watch/custom_my_list/enable', true),
                MY_LIST_ID: new PValue('video/watch/custom_my_list/id', -1),
            },
            HOLD_SETTING: {
                ENABLE: new PValue('video/watch/hold_setting/enable', true),
                CONTINUOUS: {
                    ENABLE: new SelectPValue('video/watch/hold_setting/continuous/enable', 0, HOLD_SETTING_OPTIONS),
                    HOLD_VALUE: new PValue('video/watch/hold_setting/continuous/hold_value', false)
                },
                PLAYBACK_RATE: {
                    ENABLE: new SelectPValue('video/watch/hold_setting/playback_rate/enable', 0, HOLD_SETTING_OPTIONS),
                    HOLD_VALUE: new SelectPValue('video/watch/hold_setting/playback_rate/hold_value', 3, PLAYBACK_RATE_VALUES)
                },
                PLAYER_CONTROLLER: {
                    ENABLE: new SelectPValue('video/watch/hold_setting/player_controller/enable', 0, HOLD_SETTING_OPTIONS),
                    HOLD_VALUE: new SelectPValue('video/watch/hold_setting/player_controller/hold_value', 0, PLAYER_CONTROLLER_VALUES)
                },
            }
        },
    },
    // LIVE: {}
}
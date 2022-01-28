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
class DynamicChild{
    createInstance(element){
        return new DynamicChild()
    }
    createChildElements(dynamicChild){
        return []
    }
    getChildHeader(){
        return []
    }
}
class NotificationVideo{
    constructor(notifyId, flag, notifyData, dataName,
                lastVideoId /*nullable*/,
                isInterval,
                intervalWeek /*nullable*/,
                intervalTime /*nullable*/) {
        this.notifyId = notifyId
        this.flag = flag
        this.notifyData = notifyData
        this.dataName = dataName
        this.lastVideoId = lastVideoId
        this.isInterval = isInterval
        this.intervalWeek = intervalWeek
        this.intervalTime = intervalTime
        this.isNotify = false
        this.lastCheck = Date.now()
    }
    getNotificationDynamicChild(){
        return new NotificationDynamicChild(this)
    }
}

class NotificationDynamicChild extends DynamicChild{
    constructor(notificationVideo) {
        super()
        notificationVideo && Object.assign(this,notificationVideo)
    }

    createInstance(element){
        return NotificationDynamicChild.get(element.getElementsByClassName('notify_id')[0].dataset.id)
    }
    createChildElements(dynamicChild){
        const typeDiv = document.createElement('div')
        typeDiv.className = 'notify_id'
        typeDiv.dataset.id = dynamicChild.notifyId
        typeDiv.innerText = dynamicChild.flag


        const nameDiv = document.createElement('div')
        nameDiv.innerText = dynamicChild.dataName
        return [typeDiv,nameDiv]
    }
    getChildHeader(){
        return ['種類','名前']
    }

    /**
     *
     * @param child NotificationDynamicChild
     */
    static add(child){
        let childList = JSON.parse(PARAMETER.VIDEO.NOTIFICATION.LIST.pValue)
        childList = Array.isArray(childList) ? childList : []
        childList.push(child)
        PARAMETER.VIDEO.NOTIFICATION.LIST.pValue = JSON.stringify(childList)
    }

    /**
     *
     * @param notifyId
     * @param f (notifyId)=>NotificationDynamicChild
     */
    static set(notifyId,f) {
        let childList = JSON.parse(PARAMETER.VIDEO.NOTIFICATION.LIST.pValue)
        childList = Array.isArray(childList) ? childList : []
        const index = childList.findIndex(v => v.notifyId === notifyId)
        if (index < 0) return
        childList[index] = f(childList[index])
        PARAMETER.VIDEO.NOTIFICATION.LIST.pValue = JSON.stringify(childList)
    }
    static get(notifyId) {
        let childList = JSON.parse(PARAMETER.VIDEO.NOTIFICATION.LIST.pValue)
        childList = Array.isArray(childList) ? childList : []
        const index = childList.findIndex(v => v.notifyId === notifyId)
        if (index < 0) return null
        return childList[index]
    }
    static getAll() {
        let childList = JSON.parse(PARAMETER.VIDEO.NOTIFICATION.LIST.pValue)
        childList = Array.isArray(childList) ? childList : []
        return childList
    }
    static remove(notifyId){
        let childList = JSON.parse(PARAMETER.VIDEO.NOTIFICATION.LIST.pValue)
        childList = Array.isArray(childList) ? childList : []
        const index = childList.findIndex(v => v.notifyId === notifyId)
        if (index < 0) return
        childList.splice(index,1)
        PARAMETER.VIDEO.NOTIFICATION.LIST.pValue = JSON.stringify(childList)
    }
}


class DynamicPValue extends PValue{
    constructor(_key, _default, _child) {
        super(_key, _default);
        this.child = new _child()
    }
    getChild(element){
        return this.child.createInstance(element)
    }

    onChange(e){
        if (e){
            const tBody = e.target.parentElement.parentElement.parentElement
            const array = []
            if (tBody.children){
                let rowIndex = 1
                for (let child of tBody.children){
                    array.push(this.getChild(child))
                    child.getElementsByClassName('row_index')[0].innerText = rowIndex
                    rowIndex++
                }
            }
            this.pValue = JSON.stringify(array)
        }else{
            this.pValue = this.default
        }

        showSave()
    }
    onMoveList(e){
        const isUp = e.target.textContent === '↑'
        const row = e.target.parentElement.parentElement
        const tBody = row.parentElement
        const thisIndex = row.rowIndex - 1
        let targetIndex = thisIndex + (isUp ? -1 : 2)

        if (tBody.childElementCount < targetIndex || targetIndex < 0) return
        let targetNode
        if (e.shiftKey){
            targetNode = isUp ? tBody.children[0] : null;
        }else if(tBody.childElementCount === targetIndex){
            targetNode = null
        } else{
            targetNode = tBody.children[targetIndex]
        }
        tBody.insertBefore(tBody.children[thisIndex],targetNode)
        this.onChange(e)
    }
    onDelete(e){
        const row = e.target.parentElement.parentElement
        const tBody = row.parentElement
        if (e){
            const thisIndex = row.rowIndex - 1
            tBody.children[thisIndex].remove()
            this.onChange(e)
        }
    }
    insertBodyRow(tb,dynamicChild){
        const row = tb.insertRow()

        const rowIndex = row.insertCell()
        rowIndex.textContent = row.rowIndex
        rowIndex.className = 'row_index'

        const elms = this.child.createChildElements(dynamicChild)
        for (const elm of elms){
            row.insertCell().appendChild(elm)
        }

        const deleteButton = document.createElement('button')
        deleteButton.textContent = '-'
        deleteButton.addEventListener('click',e=>{this.onDelete(e)})
        row.insertCell().appendChild(deleteButton)
        const upButton = document.createElement('button')
        upButton.textContent = '↑'
        upButton.addEventListener('click',e=>{this.onMoveList(e)})
        row.insertCell().appendChild(upButton)
        const downButton = document.createElement('button')
        downButton.textContent = '↓'
        downButton.addEventListener('click',e=>{this.onMoveList(e)})
        row.insertCell().appendChild(downButton)
    }

    get input() {
        const table = document.createElement('table')
        table.style.width = '100%'
        const thRow = table.createTHead().insertRow()
        thRow.style.textAlign = 'center'
        thRow.insertCell().textContent = 'No'
        for (const text of this.child.getChildHeader()){
            thRow.insertCell().textContent = text
        }
        thRow.insertCell() //delete
        const buttonCell = thRow.insertCell()//up, down
        buttonCell.colSpan = 2
        buttonCell.textContent = '(shift)'

        const tb = table.createTBody()
        tb.id = 'DynamicBody'
        const jsonPValues = JSON.parse(this.pValue || "null")
        if (jsonPValues && jsonPValues.length !== 0){
            for (let dynamicChild of jsonPValues){
                //既存データセット
                this.insertBodyRow(tb,dynamicChild)
            }
        }


        const tfRow = table.createTFoot().insertRow()
        const tfCell = tfRow.insertCell()
        tfCell.colSpan = 3

        // const addButton = document.createElement('button')
        // addButton.textContent = '追加'
        // addButton.addEventListener('click', () => {
        //     this.insertBodyRow(tb)
        // })
        // tfCell.appendChild(addButton)

        const clearButton = document.createElement('button')
        clearButton.textContent = 'クリア'
        clearButton.addEventListener('click',()=>this.onDelete())
        tfCell.appendChild(clearButton)

        return table
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
const MINIMUM_LIKE_VALUES = [
    {name: '通常', value: ''},
    {name: 'アイコン+いいね数', value: 'SmallLike'},
    {name: 'アイコンのみ', value: 'MinimizeLike'},
]
const CREATED_AT_VALUES = [
    {name: '10分', value: '^(([0-9])|(10))分前$'},
    {name: '20分', value: '^((1[1-9])|(20))分前$'},
    {name: '30分', value: '^((2[1-9])|(30))分前$'},
    {name: '40分', value: '^((3[1-9])|(40))分前$'},
    {name: '50分', value: '^((4[1-9])|(50))分前$'},
    {name: '1時間', value: '(^5[1-9]分前$)|(^1時間前$)'},
    {name: '2時間', value: '^2時間前$'},
    {name: '3時間', value: '^3時間前$'},
    {name: '4時間', value: '^4時間前$'},
    {name: '5時間', value: '^5時間前$'},
    {name: '6時間', value: '^6時間前$'},
    {name: '7時間', value: '^7時間前$'},
    {name: '8時間', value: '^8時間前$'},
    {name: '9時間', value: '^9時間前$'},
    {name: '10時間', value: '^10時間前$'},
    {name: '11時間', value: '^11時間前$'},
    {name: '12時間', value: '^12時間前$'},
    {name: '13時間', value: '^13時間前$'},
    {name: '14時間', value: '^14時間前$'},
    {name: '15時間', value: '^15時間前$'},
    {name: '16時間', value: '^16時間前$'},
    {name: '17時間', value: '^17時間前$'},
    {name: '18時間', value: '^18時間前$'},
    {name: '19時間', value: '^19時間前$'},
    {name: '20時間', value: '^20時間前$'},
    {name: '21時間', value: '^21時間前$'},
    {name: '22時間', value: '^22時間前$'},
    {name: '23時間', value: '^23時間前$'},
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
//要素 TO 日本語
const PARAMETER_TEXT = {
    'video/repo/filter/ad': 'ニコニ広告',
    'video/repo/filter/like': 'いいね!',
    'video/repo/filter/kiri': 'キリバン',
    'video/repo/filter/my_list': 'マイリスト',
    'video/repo/filter/live': '生放送開始',
    'video/repo/filter/live_plan': '生放送予約',
    'video/repo/filter/video': '動画投稿',
    'video/repo/filter/video_live': 'ライブ投稿',
    'video/repo/filter/video_live_plan': 'ライブ投稿予約',
    'video/repo/filter/image': '静画投稿',
    'video/repo/filter/image_clip': '静画クリップ',
    'video/repo/filter/blog': 'ブロマガ',
    'video/repo/filter/manga': 'マンガ',
    'video/repo/filter/model': 'ニコニ立体',
    'video/repo/add_watch_later': '「あとで見る」ボタン追加',
    'video/repo/highlight/ad': 'ニコニ広告',
    'video/repo/highlight/like': 'いいね!',
    'video/repo/highlight/kiri': 'キリバン',
    'video/repo/highlight/my_list': 'マイリスト',
    'video/repo/highlight/video': '動画投稿',
    'video/repo/highlight/video_live': 'ライブ投稿',
    'video/repo/highlight/video_live_plan': 'ライブ投稿予約',
    'video/repo/highlight/live': '生放送開始',
    'video/repo/highlight/live_plan': '生放送予約',
    'video/repo/highlight/image': '静画投稿',
    'video/repo/highlight/image_clip': '静画クリップ',
    'video/repo/highlight/blog': 'ブロマガ',
    'video/repo/highlight/manga': 'マンガ',
    'video/repo/highlight/model': 'ニコニ立体',
    'video/repo/side_fold/types': 'タイプ',
    'video/repo/side_fold/target': '優先順位',
    'video/repo/side_fold/filter': 'フィルター',
    'video/watch/custom_my_list/id': 'マイリストID',
    'video/watch/hold_setting/continuous/hold_value': '固定する値',
    'video/watch/hold_setting/playback_rate/hold_value': '固定する値',
    'video/watch/remove_watch_later': '「あとで見る」削除ボタン',
    'video/repo/custom_layout': 'カスタムレイアウト',
    'video/watch/minimum_like': 'いいねボタンサイズ',
    'video/watch/show_comment_list': '動画再生時コメントリスト表示',
    'video/repo/created_at_new_color': '赤字適用する投稿時間',
    'video/repo/highlight/follow': 'フォロー通知',
    'video/repo/filter/follow': 'フォロー通知',
    'video/watch/comment_replace/replace_value': '対象コメント',
    'video/repo/on_check_removed_video': '削除動画選択ボタン'
}
//KEY名　TO　日本語
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
    PLAYER_CONTROLLER: 'プレイヤーパネル',
    FOLLOW: 'フォロー通知',
    COMMENT_REPLACE: 'コメント置換',
    NOTIFICATION: '通知'
}
//判定正規表現
const REPO_TYPE = {
    AD: '^ニコニ広告しました',
    LIKE: '^動画を「いいね！」しました$',
    KIRI: '再生を達成しました$',
    MY_LIST: '^マイリスト',
    LIVE: '生放送を開始しました$',
    LIVE_PLAN: '生放送予定です$',
    VIDEO: '^動画を投稿しました$|^動画を登録しました$',
    VIDEO_LIVE: '^動画のライブ公開を開始しました$',
    VIDEO_LIVE_PLAN: '動画のライブ公開を予約しました$',
    IMAGE: '^イラストを投稿しました$',
    IMAGE_CLIP: '^イラストをクリップしました$',
    BLOG: '^ブロマガを投稿しました$',
    MANGA: 'マンガ',
    MANGA_UP: 'マンガ',
    MANGA_FAV: 'マンガ',
    MODEL: 'ニコニ立体',
    MODEL_UP: '^ニコニ立体に作品を投稿しました$',
    FOLLOW: 'さんにフォローされました'
}
//新旧互換
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
}

const PARAMETER = {
    VIDEO: {
        REPO: {
            CUSTOM_LAYOUT: new PValue('video/repo/custom_layout', true),
            ADD_WATCH_LATER: new PValue('video/repo/add_watch_later', true),
            CREATED_AT_NEW_COLOR: new SelectPValue('video/repo/created_at_new_color',5,CREATED_AT_VALUES),
            ON_CHECK_REMOVED_VIDEO: new  PValue('video/repo/on_check_removed_video',true),
            HIGHLIGHT: {
                ENABLE: new PValue('video/repo/highlight/enable', true),
                AD: new MatcherPValue('video/repo/highlight/ad', '#FFFFFFFF', REPO_TYPE.AD),
                LIKE: new MatcherPValue('video/repo/highlight/like', '#A5D17814', REPO_TYPE.LIKE),
                KIRI: new MatcherPValue('video/repo/highlight/kiri', '#FFFFFFFF', REPO_TYPE.KIRI),
                MY_LIST: new MatcherPValue('video/repo/highlight/my_list', '#76B3F914', REPO_TYPE.MY_LIST),
                VIDEO: new MatcherPValue('video/repo/highlight/video', '#d0021b14', REPO_TYPE.VIDEO),
                VIDEO_LIVE:  new MatcherPValue('video/repo/highlight/video_live', '#FFFFFFFF', REPO_TYPE.VIDEO_LIVE),
                VIDEO_LIVE_PLAN:  new MatcherPValue('video/repo/highlight/video_live_plan', '#FFFFFFFF', REPO_TYPE.VIDEO_LIVE_PLAN),
                LIVE: new MatcherPValue('video/repo/highlight/live', '#FFFFFFFF', REPO_TYPE.LIVE),
                LIVE_PLAN: new MatcherPValue('video/repo/highlight/live_plan', '#FFFFFFFF', REPO_TYPE.LIVE_PLAN),
                IMAGE: new MatcherPValue('video/repo/highlight/image', '#FFFFFFFF', REPO_TYPE.IMAGE),
                IMAGE_CLIP: new MatcherPValue('video/repo/highlight/image_clip', '#FFFFFFFF', REPO_TYPE.IMAGE_CLIP),
                BLOG: new MatcherPValue('video/repo/highlight/blog', '#FFFFFFFF', REPO_TYPE.BLOG),
                MANGA: new MatcherPValue('video/repo/highlight/manga', '#FFFFFFFF', REPO_TYPE.MANGA),
                MODEL: new MatcherPValue('video/repo/highlight/model', '#FFFFFFFF', REPO_TYPE.MODEL),
                FOLLOW: new MatcherPValue('video/repo/highlight/follow','#FFFFFFFF',REPO_TYPE.FOLLOW)
            },
            FILTER: {
                ENABLE: new PValue('video/repo/filter/enable', true),
                AD: new MatcherPValue('video/repo/filter/ad', false, REPO_TYPE.AD),
                LIKE: new MatcherPValue('video/repo/filter/like', false, REPO_TYPE.LIKE),
                KIRI: new MatcherPValue('video/repo/filter/kiri', false, REPO_TYPE.KIRI),
                MY_LIST: new MatcherPValue('video/repo/filter/my_list', false, REPO_TYPE.MY_LIST),
                LIVE: new MatcherPValue('video/repo/filter/live', false, REPO_TYPE.LIVE),
                LIVE_PLAN: new MatcherPValue('video/repo/filter/live_plan', false, REPO_TYPE.LIVE_PLAN),
                VIDEO: new MatcherPValue('video/repo/filter/video', false, REPO_TYPE.VIDEO),
                VIDEO_LIVE:  new MatcherPValue('video/repo/filter/video_live', false, REPO_TYPE.VIDEO_LIVE),
                VIDEO_LIVE_PLAN:  new MatcherPValue('video/repo/filter/video_live_plan', false, REPO_TYPE.VIDEO_LIVE_PLAN),
                IMAGE: new MatcherPValue('video/repo/filter/image', false, REPO_TYPE.IMAGE),
                IMAGE_CLIP: new MatcherPValue('video/repo/filter/image_clip', false, REPO_TYPE.IMAGE_CLIP),
                BLOG: new MatcherPValue('video/repo/filter/blog', false, REPO_TYPE.BLOG),
                MANGA: new MatcherPValue('video/repo/filter/manga', false, REPO_TYPE.MANGA),
                MODEL: new MatcherPValue('video/repo/filter/model', false, REPO_TYPE.MODEL),
                FOLLOW: new MatcherPValue('video/repo/filter/follow',false,REPO_TYPE.FOLLOW)
            },
            SIDE_FOLD: {
                TYPES: new PValue('video/repo/side_fold/types', true),
                TARGET: new PValue('video/repo/side_fold/target', true),
                FILTER: new PValue('video/repo/side_fold/filter', true),
            }
        },
        WATCH: {
            REMOVE_WATCH_LATER: new PValue('video/watch/remove_watch_later', true),
            // MINIMUM_LIKE: new  SelectPValue('video/watch/minimum_like', 1,MINIMUM_LIKE_VALUES),
            SHOW_COMMENT_LIST: new PValue('video/watch/show_comment_list',true),
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
            }
        },
        NOTIFICATION: {
            LIST: new DynamicPValue('video/notification/list','null',NotificationDynamicChild)
        }
    },
    // LIVE: {}
}
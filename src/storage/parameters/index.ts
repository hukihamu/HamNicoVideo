// 汎用Value
import {nicoRepoMatcher} from '@/storage/parameters/nico_repo_matcher';


interface ParameterBaseValue{
    enable: boolean
}
interface ParameterSelectValue extends ParameterBaseValue{
    selectIndex: number
    selectList: {
        name: string,
        value: string
    }[]
}
interface ParameterStaticValues<T> extends ParameterBaseValue{
    values: T[]
}
interface ParameterDynamicValues<T> extends ParameterBaseValue{
    dynamicValues: T[]
    createView: (value?: T)=>HTMLDivElement
    getValue: (element: HTMLDivElement)=> T
}

// valuesType
// interface ValuesBase<EDITABLE, TEMPLATE> {
//     editable: EDITABLE
//     template: TEMPLATE
// }
export interface ValuesCheckBox{
    enable: boolean
    name: string
}
export interface ValuesNicoRepoMatcher extends ValuesCheckBox{
    matcher: string
}
export interface ValuesHighLight extends ValuesNicoRepoMatcher{
    color: string
}
interface ValuesSeries{
    seriesId: string
    seriesName: string
    isInterval: boolean //周期確認を行うか
    intervalWeek: number // 0 ~ 6
    intervalTime: number
    isNotify: boolean //未読か
    lastVideoId: string // 最後に確認した動画ID
}


// param登録
export type ParametersType = {
    Video_MyPage_AddWatchLater: ParameterBaseValue,
    Video_MyPage_SlimItem: ParameterBaseValue,
    Video_MyPage_HighlightNewRange: ParameterSelectValue,
    Video_MyPage_Highlight: ParameterStaticValues<ValuesHighLight>,
    Video_MyPage_HiddenFilter: ParameterStaticValues<ValuesNicoRepoMatcher>
    Video_MyPage_HideSideBar: ParameterStaticValues<ValuesCheckBox>,
    Video_Watch_ChangeVideoList: ParameterBaseValue,
    Video_Watch_RemoveWatchLater: ParameterBaseValue,
    Video_Watch_MinimizeLike: ParameterSelectValue,
}
// default設定
export const parameterDefault: ParametersType = {
    Video_Watch_MinimizeLike: {
        enable: true,
        selectIndex: 1,
        selectList: [
            {name: "最小化", value: "MinimizeLike"},
            {name: "小型化", value: "SmallLike"},
            {name: "通常", value: ""}
        ]
    },
    Video_Watch_RemoveWatchLater: {enable: true},
    Video_Watch_ChangeVideoList: {enable: true},
    Video_MyPage_HideSideBar: {
        enable: true,
        values: [
            {name: "タイプ", enable: true},
            {name: "表示対象", enable: true},
            {name: "非表示フィルター", enable: false}
        ]
    },
    Video_MyPage_HiddenFilter: {
        enable: true,
        values: [
            Object.assign({enable: false}, nicoRepoMatcher.AD),
            Object.assign({enable: false}, nicoRepoMatcher.LIKE),
            Object.assign({enable: false}, nicoRepoMatcher.KIRI),
            Object.assign({enable: false}, nicoRepoMatcher.MY_LIST),
            Object.assign({enable: false}, nicoRepoMatcher.LIVE),
            Object.assign({enable: false}, nicoRepoMatcher.LIVE_PLAN),
            Object.assign({enable: false}, nicoRepoMatcher.VIDEO_UP),
            Object.assign({enable: false}, nicoRepoMatcher.VIDEO_LIVE),
            Object.assign({enable: false}, nicoRepoMatcher.VIDEO_LIVE_PLAN),
            Object.assign({enable: false}, nicoRepoMatcher.IMAGE),
            Object.assign({enable: false}, nicoRepoMatcher.IMAGE_CLIP),
            Object.assign({enable: false}, nicoRepoMatcher.BLOG),
            Object.assign({enable: false}, nicoRepoMatcher.MANGA),
            Object.assign({enable: false}, nicoRepoMatcher.MODEL),
            Object.assign({enable: false}, nicoRepoMatcher.FOLLOW),
        ]
    },
    Video_MyPage_Highlight: {
        enable: true,
        values: [
            Object.assign({enable: true, color: '#A5D17814'}, nicoRepoMatcher.LIKE),
            Object.assign({enable: true, color: '#76B3F914'}, nicoRepoMatcher.MY_LIST),
            Object.assign({enable: true, color: '#d0021b14'}, nicoRepoMatcher.VIDEO_UP),

            Object.assign({enable: false, color: '#FFFFFFFF'}, nicoRepoMatcher.AD),
            Object.assign({enable: false, color: '#FFFFFFFF'}, nicoRepoMatcher.KIRI),
            Object.assign({enable: false, color: '#FFFFFFFF'}, nicoRepoMatcher.LIVE),
            Object.assign({enable: false, color: '#FFFFFFFF'}, nicoRepoMatcher.LIVE_PLAN),
            Object.assign({enable: false, color: '#FFFFFFFF'}, nicoRepoMatcher.VIDEO_LIVE),
            Object.assign({enable: false, color: '#FFFFFFFF'}, nicoRepoMatcher.VIDEO_LIVE_PLAN),
            Object.assign({enable: false, color: '#FFFFFFFF'}, nicoRepoMatcher.IMAGE),
            Object.assign({enable: false, color: '#FFFFFFFF'}, nicoRepoMatcher.IMAGE_CLIP),
            Object.assign({enable: false, color: '#FFFFFFFF'}, nicoRepoMatcher.BLOG),
            Object.assign({enable: false, color: '#FFFFFFFF'}, nicoRepoMatcher.MANGA),
            Object.assign({enable: false, color: '#FFFFFFFF'}, nicoRepoMatcher.MODEL),
            Object.assign({enable: false, color: '#FFFFFFFF'}, nicoRepoMatcher.FOLLOW),
        ]
    },
    Video_MyPage_AddWatchLater: {enable: true},
    Video_MyPage_SlimItem: {enable: true},
    Video_MyPage_HighlightNewRange: {
        enable: true,
        selectIndex: 5,
        selectList: [
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
            {name: '23時間', value: '^23時間前$'}
        ]}

}
// TODO 適時追記
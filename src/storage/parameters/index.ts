import {nicoRepoMatcher, NicoRepoMatcherType} from '@/storage/parameters/nico_repo_matcher';
import {ParameterSelectValue} from '@/storage/parameters/parameter_value/parameter_select_value';
import {ParameterStaticValues} from '@/storage/parameters/parameter_value/parameter_static_values';
import {ValuesHighLight} from '@/storage/parameters/values_type/values_high_light';
import {ValuesNicoRepoMatcher} from '@/storage/parameters/values_type/values_nico_repo_matcher';
import {ValuesCheckBox} from '@/storage/parameters/values_type/values_check_box';
import {ParameterBaseValue} from '@/storage/parameters/parameter_value/parameter_base_value';
import {ParameterTextValue} from '@/storage/parameters/parameter_value/parameter_text_value';
import {ParameterDynamicValues} from '@/storage/parameters/parameter_value/parameter_dynamic_values';
import {ValuesNotify} from '@/storage/parameters/values_type/values_notify';


/**
 *
 */
export type ParametersType = {
    Video_MyPage_AddWatchLater: ParameterBaseValue,
    Video_MyPage_SlimItem: ParameterBaseValue,
    Video_MyPage_HighlightNewRange: ParameterSelectValue,
    Video_MyPage_Highlight: ParameterStaticValues<ValuesHighLight, keyof NicoRepoMatcherType>,
    Video_MyPage_HiddenFilter: ParameterStaticValues<ValuesNicoRepoMatcher, keyof NicoRepoMatcherType>
    Video_MyPage_HideSideBar: ParameterStaticValues<ValuesCheckBox<'TYPE' | 'FILTER' | 'HIDDEN_FILTER'>, 'TYPE' | 'FILTER' | 'HIDDEN_FILTER'>,
    Video_Watch_ChangeVideoList: ParameterBaseValue,
    Video_Watch_RemoveWatchLater: ParameterBaseValue,
    Video_Watch_MinimizeLike: ParameterSelectValue,
    Video_Watch_OneClickMyList: ParameterTextValue,
    Notify_NotifyList: ParameterDynamicValues<ValuesNotify>
}
// default設定 TODO 適時追記
export const parameterDefault: ParametersType = {
    Notify_NotifyList: {
        config: {
            enable: true,
            dynamicValues: []
        }
    },
    Video_Watch_OneClickMyList: {
        config: {
            enable: true,
            textValue: ''
        }
    },
    Video_Watch_MinimizeLike: {
        config: {
            enable: true,
            templateVersion: 1,
            selectIndex: 1,
        },
        template: {
            selectList: [
                {name: '最小化', value: 'MinimizeLike'},
                {name: '小型化', value: 'SmallLike'},
                {name: '通常', value: ''}
            ]
        }
    },
    Video_Watch_RemoveWatchLater: {
        config: {
            enable: true
        }
    },
    Video_Watch_ChangeVideoList: {
        config: {
            enable: true
        }
    },
    Video_MyPage_HideSideBar: {
        config: {
            enable: true,
            templateVersion: 1,
            values: [
                {valueId: 'TYPE', enable: true},
                {valueId: 'FILTER', enable: true},
                {valueId: 'HIDDEN_FILTER', enable: false}
            ]
        },
        template: {
            values: {
                TYPE: {name: 'タイプ'},
                FILTER: {name: '表示対象'},
                HIDDEN_FILTER: {name: '非表示フィルター'}
            }
        }
    },
    Video_MyPage_HiddenFilter: {
        config: {
            enable: true,
            templateVersion: 1,
            values: [
                {enable: false, valueId: nicoRepoMatcher.VIDEO_UP.valueId},
                {enable: false, valueId: nicoRepoMatcher.VIDEO_LIVE.valueId},
                {enable: false, valueId: nicoRepoMatcher.VIDEO_LIVE_PLAN.valueId},
                {enable: false, valueId: nicoRepoMatcher.KIRI.valueId},
                {enable: false, valueId: nicoRepoMatcher.MY_LIST.valueId},
                {enable: false, valueId: nicoRepoMatcher.LIKE.valueId},
                {enable: false, valueId: nicoRepoMatcher.AD.valueId},
                {enable: false, valueId: nicoRepoMatcher.LIVE_START.valueId},
                {enable: false, valueId: nicoRepoMatcher.LIVE_PLAN.valueId},
                {enable: false, valueId: nicoRepoMatcher.IMAGE_UP.valueId},
                {enable: false, valueId: nicoRepoMatcher.IMAGE_CLIP.valueId},
                {enable: false, valueId: nicoRepoMatcher.BLOG_UP.valueId},
                {enable: false, valueId: nicoRepoMatcher.MANGA_UP.valueId},
                {enable: false, valueId: nicoRepoMatcher.MANGA_FAV.valueId},
                {enable: false, valueId: nicoRepoMatcher.MODEL_UP.valueId},
                {enable: false, valueId: nicoRepoMatcher.MODEL_FAV.valueId},
                {enable: false, valueId: nicoRepoMatcher.FOLLOW.valueId},
            ]
        },
        template: {
            values: {
                VIDEO_UP: nicoRepoMatcher.VIDEO_UP,
                VIDEO_LIVE: nicoRepoMatcher.VIDEO_LIVE,
                VIDEO_LIVE_PLAN: nicoRepoMatcher.VIDEO_LIVE_PLAN,
                KIRI: nicoRepoMatcher.KIRI,
                MY_LIST: nicoRepoMatcher.MY_LIST,
                LIKE: nicoRepoMatcher.LIKE,
                AD: nicoRepoMatcher.AD,
                LIVE_START: nicoRepoMatcher.LIVE_START,
                LIVE_PLAN: nicoRepoMatcher.LIVE_PLAN,
                IMAGE_UP: nicoRepoMatcher.IMAGE_UP,
                IMAGE_CLIP: nicoRepoMatcher.IMAGE_CLIP,
                BLOG_UP: nicoRepoMatcher.BLOG_UP,
                MANGA_UP: nicoRepoMatcher.MANGA_UP,
                MANGA_FAV: nicoRepoMatcher.MANGA_FAV,
                MODEL_UP: nicoRepoMatcher.MODEL_UP,
                MODEL_FAV: nicoRepoMatcher.MODEL_FAV,
                FOLLOW: nicoRepoMatcher.FOLLOW,
            }
        }
    },
    Video_MyPage_Highlight: {
        config: {
            enable: true,
            templateVersion: 1,
            values: [
                {enable: true, color: '#d0021b14', valueId: nicoRepoMatcher.VIDEO_UP.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.VIDEO_LIVE.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.VIDEO_LIVE_PLAN.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.KIRI.valueId},
                {enable: true, color: '#76B3F914', valueId: nicoRepoMatcher.MY_LIST.valueId},
                {enable: true, color: '#A5D17814', valueId: nicoRepoMatcher.LIKE.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.AD.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.LIVE_START.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.LIVE_PLAN.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.IMAGE_UP.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.IMAGE_CLIP.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.BLOG_UP.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.MANGA_UP.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.MANGA_FAV.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.MODEL_UP.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.MODEL_FAV.valueId},
                {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.FOLLOW.valueId},
            ]
        },
        template: {
            values: {
                VIDEO_UP: nicoRepoMatcher.VIDEO_UP,
                VIDEO_LIVE: nicoRepoMatcher.VIDEO_LIVE,
                VIDEO_LIVE_PLAN: nicoRepoMatcher.VIDEO_LIVE_PLAN,
                KIRI: nicoRepoMatcher.KIRI,
                MY_LIST: nicoRepoMatcher.MY_LIST,
                LIKE: nicoRepoMatcher.LIKE,
                AD: nicoRepoMatcher.AD,
                LIVE_START: nicoRepoMatcher.LIVE_START,
                LIVE_PLAN: nicoRepoMatcher.LIVE_PLAN,
                IMAGE_UP: nicoRepoMatcher.IMAGE_UP,
                IMAGE_CLIP: nicoRepoMatcher.IMAGE_CLIP,
                BLOG_UP: nicoRepoMatcher.BLOG_UP,
                MANGA_UP: nicoRepoMatcher.MANGA_UP,
                MANGA_FAV: nicoRepoMatcher.MANGA_FAV,
                MODEL_UP: nicoRepoMatcher.MODEL_UP,
                MODEL_FAV: nicoRepoMatcher.MODEL_FAV,
                FOLLOW: nicoRepoMatcher.FOLLOW,
            }
        }
    },
    Video_MyPage_AddWatchLater: {config: {enable: true}},
    Video_MyPage_SlimItem: {config: {enable: true}},
    Video_MyPage_HighlightNewRange: {
        config: {
            enable: true,
            selectIndex: 5,
            templateVersion: 1
        },
        template: {
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
            ]
        }
    }
}
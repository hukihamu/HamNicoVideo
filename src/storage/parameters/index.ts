
export interface ParameterBaseValue {
    enable: boolean
}
export interface ParameterSelectValue extends ParameterBaseValue{
    selectIndex: number
    selectList: {
        name: string,
        value: string
    }[]
}

export type ParametersType = {
    Video_MyPage_NicoRepo_AddWatchLater: ParameterBaseValue,
    Video_MyPage_NicoRepo_SlimItem: ParameterBaseValue,
    Video_MyPage_NicoRepo_HighlightNewRange: ParameterSelectValue
}
export const parameterDefault: ParametersType = {
    Video_MyPage_NicoRepo_AddWatchLater: {enable: true},
    Video_MyPage_NicoRepo_SlimItem: {enable: true},
    Video_MyPage_NicoRepo_HighlightNewRange: {
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
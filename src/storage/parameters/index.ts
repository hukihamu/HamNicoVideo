
export interface ParameterBaseValue {
    enable: boolean
}

export type ParametersType = {
    Video_MyPage_NicoRepo_AddWatchLater: ParameterBaseValue,
    Video_MyPage_NicoRepo_SlimItem: ParameterBaseValue
}
export const parameterDefault: ParametersType = {
    Video_MyPage_NicoRepo_AddWatchLater: {enable: true},
    Video_MyPage_NicoRepo_SlimItem: {enable: true}
}
// TODO 適時追記
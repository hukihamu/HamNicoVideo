export interface ValuesNotify extends ValuesBase<number>{
    config: {
        valueId: number
        //周期確認を行うか
        isInterval: boolean
        // 0 ~ 6
        intervalWeek: number[]
        //確認時間
        intervalTime: string | undefined
        // 最後に確認した動画ID null->取得しやすい動画を参照
        lastWatchId: string | undefined
        // 最終確認日時
        lastCheckDateTime: number
        // グループとしてまとめるタグ
        groupTag: string | undefined
        // 各対象の専用変数
        notifyDetail: NotifyDetail
    }
}
export type NotifyDetail = NotifyDetailSeries | NotifyDetailUserVideo | NotifyDetailTag
export interface NotifyDetailSeries {
    seriesId: string
    seriesName: string
    isReverse: boolean // 確認順を反転させるか
}
export interface NotifyDetailUserVideo {
    userId: number
    userName: string
    lastCheckIndex: number
}
export interface NotifyDetailTag {
    searchTagText: string
    lastCheckPage: number
}
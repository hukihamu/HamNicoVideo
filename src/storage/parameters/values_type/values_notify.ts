export interface ValuesNotify extends ValuesBase<number>{
    config: {
        valueId: number
        isInterval: boolean //周期確認を行うか
        intervalWeek: number[] // 0 ~ 6
        intervalTime: string | undefined //確認時間
        lastWatchId: string | undefined // 最後に確認した動画ID null->取得しやすい動画を参照
        lastCheckDateTime: number // 最終確認日時
        groupTag: string | undefined // グループとしてまとめるタグ
        notifyDetail: NotifyDetail // 各対象の専用変数
    }
}
export type NotifyDetail = NotifyDetailSeries | NotifyDetailUserVideo
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
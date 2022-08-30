export interface ValuesNotify extends ValuesBase<number>{
    config: {
        valueId: number
        isInterval: boolean //周期確認を行うか
        intervalWeek: number[] // 0 ~ 6
        intervalTime: string | undefined //確認時間
        isNotify: boolean //未読か
        lastWatchId: string | undefined // 最後に確認した動画ID null->取得しやすい動画を参照
        lastCheckDateTime: number // 最終確認日時
        notifyDetail: NotifyDetail
    }
}
export type NotifyDetail = ValuesNotifySeries | ValueNotifyUserVideo
export interface ValuesNotifySeries {
    seriesId: string
    seriesName: string
}
export interface ValueNotifyUserVideo {
    userId: number
    userName: string
    isCh: boolean
    lastCheckIndex: number
}
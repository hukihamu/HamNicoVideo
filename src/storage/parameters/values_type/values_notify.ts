interface ValuesNotify extends ValuesBase<number>{
    isInterval: boolean //周期確認を行うか
    intervalWeek: number[] // 0 ~ 6
    intervalTime: string | null //確認時間
    isNotify: boolean //未読か
    lastVideoId: string | undefined | 'first' // 最後に確認した動画ID null->最新の動画を参照 'first'->最初の動画を参照
}

interface ValuesNotifySeries extends ValuesNotify{
    seriesId: string
    seriesName: string
}
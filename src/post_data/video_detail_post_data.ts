import {WatchDetailType} from '@/nico_client/watch_detail';

export interface VideoDetailPostData {
    watchId: string //動画Id
    title: string //動画タイトル
    description: string //説明文
    thumbnailUrl: string //サムネURL
    viewCounter: number //再生数
    commentNum: number //コメント数
    myListCounter: number //マイリスト数
    length: number //動画の長さ(秒)
    firstRetrieve: string //投稿日時
    likeCounter: number //いいね数
    isCH: boolean // チャンネル動画
    isPremiumOnly: boolean //プレミアム限定動画
    isPaid: boolean //有料動画
}

export const toVideoDetailPostData = (watchDetail: WatchDetailType): VideoDetailPostData => {
    return {
        watchId: watchDetail.data.client.watchId,
        title: watchDetail.data.video.title,
        description: watchDetail.data.video.description,
        length: watchDetail.data.video.duration,
        commentNum: watchDetail.data.video.count.comment,
        firstRetrieve: watchDetail.data.video.registeredAt,
        myListCounter: watchDetail.data.video.count.mylist,
        thumbnailUrl: watchDetail.data.video.thumbnail.url,
        viewCounter: watchDetail.data.video.count.view,
        isPaid: watchDetail.data.payment.video.isPpv,
        isCH: watchDetail.data.channel !== null,
        isPremiumOnly: watchDetail.data.payment.video.isPremium,
        likeCounter: watchDetail.data.video.count.like,
    }
}
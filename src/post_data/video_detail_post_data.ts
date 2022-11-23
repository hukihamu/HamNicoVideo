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


export interface VideoDetailPostData {
    //動画Id
    watchId: string
    //動画タイトル
    title: string
    //説明文
    description: string
    //サムネURL
    thumbnailUrl: string
    //再生数
    viewCounter: number
    //コメント数
    commentNum: number
    //マイリスト数
    myListCounter: number
    //動画の長さ(秒)
    length: number
    //投稿日時
    firstRetrieve: string
    //いいね数
    likeCounter: number
    // チャンネル動画
    isCH: boolean
    //プレミアム限定動画
    isPremiumOnly: boolean
    //有料動画
    isPaid: boolean
}


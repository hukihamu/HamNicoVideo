type InitialDataType = {
    "channel": {}|null
    "video": {
        "title": string,
        "description": string,
        "count": {
            "view": number,
            "comment": number,
            "mylist": number,
            "like": number,
        },
        duration: number,
        "thumbnail": {
            "url": string,
        },
        "registeredAt": string,
        "isDeleted": false,
    },
    "payment": {
        "video": {
            "isPpv": boolean,
            "isPremium": boolean,
        }
    }
}

interface VideoDetail{
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

export const getVideoDetail = async (watchId: string): Promise<VideoDetail>=>{
    return fetch('https://www.nicovideo.jp/watch/' + watchId).then(resp =>{
        return resp.text()
    }).then(value => {
        const doc = new DOMParser().parseFromString(value, 'text/html')
        const jsonString = doc.getElementById('js-initial-watch-data').dataset['apiData']
        const json: InitialDataType = JSON.parse(jsonString)
        return {
            watchId: watchId,
            title: json.video.title,
            description: json.video.description,
            length: json.video.duration,
            commentNum: json.video.count.comment,
            firstRetrieve: json.video.registeredAt,
            myListCounter: json.video.count.mylist,
            thumbnailUrl: json.video.thumbnail.url,
            viewCounter: json.video.count.view,
            isPaid: json.payment.video.isPpv,
            isCH: json.channel !== null,
            isPremiumOnly: json.payment.video.isPremium,
            likeCounter: json.video.count.like,
        }
    })
}
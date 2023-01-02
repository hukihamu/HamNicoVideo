import {VideoDetailPostData} from '@/post_data/video_detail_post_data';

type SeriesType = {
    data: {
        "items": {
            video: {
                "acf68865": boolean // プレミアム
                "id": string
                count: {
                    comment: number
                    like: number
                    mylist: number
                    view: number
                }
                duration: number
                isChannelVideo: boolean
                isPaymentRequired: boolean
                registeredAt: string
                shortDescription: string
                title: string
                thumbnail: {
                    url: string
                }
            }
        }[]
    }
}


export const series = {
    get: async (seriesId: string): Promise<VideoDetailPostData[]>=>{
        return fetch('https://nvapi.nicovideo.jp/v1/series/' + seriesId, {
            headers: {
                'X-Frontend-Id': '6',
                'X-Frontend-Version': '0',
            }
        }).then(value => value.json() as Promise<SeriesType>).then(json=>{
            return json.data.items.map<VideoDetailPostData>(v =>({
                watchId: v.video.id,
                title: v.video.title,
                firstRetrieve: v.video.registeredAt,
                length: v.video.duration,
                isPremiumOnly: v.video.acf68865,
                isPaid: v.video.isPaymentRequired,
                description: v.video.shortDescription,
                isCH: v.video.isChannelVideo,
                thumbnailUrl: v.video.thumbnail.url,
                myListCounter: v.video.count.mylist,
                likeCounter: v.video.count.like,
                commentNum: v.video.count.comment,
                viewCounter: v.video.count.view
            }))
        })
    }
}
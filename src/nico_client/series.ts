export type SeriesType = {
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
    get: async (seriesId: string): Promise<SeriesType>=>{
        return fetch('https://nvapi.nicovideo.jp/v1/series/' + seriesId, {
            headers: {
                'X-Frontend-Id': '6',
                'X-Frontend-Version': '0',
            }
        }).then(value => value.json())
    }
}
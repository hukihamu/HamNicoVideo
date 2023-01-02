import util from '@/util';

export type WatchDetailType = {
    'data': {
        "channel": {
            id: string
            name: string
        }|null
        "client": {
            "watchId": string
        }
        "owner": {
            id: number
            nickname: string
            isVideosPublic: boolean
        } | null
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
        "series": {
            "id": number
            "title": string
            "video": {
                next: {
                    id: string
                } | null
                prev: {
                    id: string
                } | null
            }
        }
        "tag": {
            items: {
                name: string
            }[]
        }
        comment: {
            nvComment: {
                // `/v1/threads`と合わせて利用
                server: string
                params: any
                threadKey: string
            }
        }
    }
}
export const watchDetail = {
    get: async (watchId: string): Promise<WatchDetailType>=>{
        // Webスマホ版にて対応
        return fetch(`https://www.nicovideo.jp/api/watch/v3_guest/${watchId}?actionTrackId=${util.getRandomString(10)}_${util.getRandomNumber(13)}&additionals=series&skips=harmful`, {
            method: 'post',
            headers: {
                'X-Frontend-Id': '3',
                'X-Frontend-Version': '0.1.0'
            }
        }).then(async value => {
            if (value.status !== 200) {
                console.error(value)
                util.throwText('動画取得に失敗')
            }
            return value.json()
        })
    }
}
import {getRandomNumber, getRandomString} from '@/util';

export type WatchDetailType = {
    'data': {
        "channel": {}|null
        "client": {
            "watchId": string
        }
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
    }
}
export const watchDetail = {
    get: async (watchId: string): Promise<WatchDetailType>=>{
        return fetch(`https://www.nicovideo.jp/api/watch/v3_guest/${watchId}?actionTrackId=${getRandomString(10)}_${getRandomNumber(13)}&additionals=series`, {
            method: 'post',
            headers: {
                'X-Frontend-Id': '6',
                'X-Frontend-Version': '0'
            }
        }).then(value => value.json())
    }
}
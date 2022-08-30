export type UserVideosType = {
    'data': {
        items: {
            essential: {
                id: string
            }
        }[]
        totalCount: number // 動画総数
    }
}
export const users = {
    /**
     *
     * @param userId
     * @param page ページサイズ100づつ
     */
    get: async (userId: number, page: number = 1): Promise<UserVideosType>=>{
        return fetch(`https://nvapi.nicovideo.jp/v3/users/${userId}/videos?sortKey=registeredAt&sortOrder=desc&pageSize=100&page=${page}`, {
            method: 'get',
            headers: {
                'X-Frontend-Id': '6',
                'X-Frontend-Version': '0'
            }
        }).then(value => {
            return value.json()
        })
    }
}
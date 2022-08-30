export type ChannelVideosType = {
    'niconico_response': {
        total_count: number
        video_info: {
            video: {
                id: string
            }
        }[]
    }
}
export const channels = {
    /**
     *
     * @param channelId
     * @param offset 次回表示index
     */
    get: async (channelId: number|string, offset: number = 0): Promise<ChannelVideosType> => {
        return fetch(`https://api.ce.nicovideo.jp/nicoapi/v1/community.video?id=ch${channelId}&from=${offset}`, {
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
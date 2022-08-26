
import util from '@/util';

export type ChannelsType = {
  'data': {
    items: {
      id: string
      link: string
    }[]
    lastPublishedAt: string
    link: string
  }
}
export const channels = {
  get: async (channelId: string): Promise<ChannelsType>=>{
    return fetch(`https://public.api.nicovideo.jp/v1/channel/channelapp/content/videos.json?channelId=${channelId}&page=1`, {
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
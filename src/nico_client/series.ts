export const getSeries = async (seriesId: string): Promise<string[]> => {
    return fetch('https://www.nicovideo.jp/series/' + seriesId).then(resp => {
        return resp.text()
    }).then(value => {
        const doc = new DOMParser().parseFromString(value, 'text/html')
        const watchIdList: string[] = []
        for (const media of Array.from(doc.body.getElementsByClassName('NC-MediaObject NC-VideoMediaObject SeriesVideoListContainer-video'))) {
            const url = (media.getElementsByClassName('NC-Link NC-MediaObject-contents')[0] as HTMLAnchorElement).href
            const videoId = url.replace('https://www.nicovideo.jp/watch/', '')
            watchIdList.push(videoId)
        }
        return watchIdList
    })
}
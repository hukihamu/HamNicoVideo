type SeriesType = {
    data: {
        "items": {
            video: {
                "id": string
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
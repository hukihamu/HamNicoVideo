export const myList = {
    getMyListName: async (myListId: string): Promise<string>=>{
        return fetch('https://nvapi.nicovideo.jp/v1/users/me/mylists', {
            method: 'get',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'X-Frontend-Id': '6',
                'X-Frontend-Version': '0',
                'X-Niconico-Language': 'ja-jp',
                'X-Request-With': 'https://www.nicovideo.jp'
            }
        }).then((resp)=>resp.json()).then((json)=>{
            const myLists = json['data']['mylists']
            for (let myList of myLists) {
                if (myList['id'].toString() === myListId.toString()) {
                    return myList['name'].toString()
                }
            }
        })
    },
    addMyList: async (myListId: string, videoId: string): Promise<Response>=>{
        const url = 'https://nvapi.nicovideo.jp/v1/users/me/mylists/{myListId}/items?itemId={itemId}&description='
            .replace('{myListId}', myListId)
            .replace('{itemId}', videoId)

        return fetch(url, {
            method: 'post',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'X-Frontend-Id': '6',
                'X-Frontend-Version': '0',
                'X-Niconico-Language': 'ja-jp',
                'X-Request-With': 'https://www.nicovideo.jp'
            }
        })
    }
}
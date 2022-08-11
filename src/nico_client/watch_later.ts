export type WatchLaterType = {
    data: {
        watchLater: {
            items: {
                watchId: string,
                itemId: string
            }[],
            hasNext: boolean
        }
    }
}

export const watchLater = {
    addWatchLater(watchId: string,
                         wait: ()=>void,
                         succeed: ()=>void,
                         failed: ()=>void,
                         error: ()=>void){
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                switch (xhr.status){
                    case 201:{
                        succeed()
                        break
                    }
                    case 409:{
                        failed()
                        break
                    }
                    default:{
                        error()
                        console.log('Failed. HttpStatus: ' + xhr.statusText)
                    }
                }
                setTimeout(wait,5000)
            }
        }
        xhr.withCredentials = true
        xhr.open('POST', 'https://nvapi.nicovideo.jp/v1/users/me/watch-later')
        xhr.setRequestHeader('X-Frontend-Id','6')
        xhr.setRequestHeader('X-Frontend-Version','0')
        xhr.setRequestHeader('X-Niconico-Language','ja-jp')
        xhr.setRequestHeader('X-Request-With','https://www.nicovideo.jp')
        xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=UTF-8')

        xhr.send('watchId={watchId}&memo='.replace('{watchId}',watchId))
    },
    removeWatchLater(itemId: string,wait: ()=>void,succeed: ()=>void,failed: ()=>void){
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (JSON.parse(xhr.response)['meta']['status'] === 200) {
                    succeed()
                } else {
                    failed()
                }
                const waitFun = () => {
                    wait()
                }
                setTimeout(waitFun, 5000)
            }
        }
        xhr.open('DELETE', 'https://nvapi.nicovideo.jp/v1/users/me/watch-later?itemIds=' + itemId)
        xhr.withCredentials = true
        xhr.setRequestHeader('X-Frontend-Id','6')
        xhr.setRequestHeader('X-Frontend-Version','0')
        xhr.setRequestHeader('X-Niconico-Language','ja-jp')
        xhr.setRequestHeader('X-Request-With','https://www.nicovideo.jp')
        xhr.send()
    },
    isWatchLater(callback: (itemId: string)=>void,watchId: string,page= 1){
        const xhr = new XMLHttpRequest()
        xhr.open('GET', `https://nvapi.nicovideo.jp/v1/users/me/watch-later?sortKey=addedAt&sortOrder=desc&pageSize=100&page=${page}`)
        xhr.onreadystatechange = ()=>{
            if (xhr.readyState === 4 && xhr.status === 200) {
                const json: WatchLaterType = JSON.parse(xhr.response)
                const watchLater = json.data.watchLater
                for (const item of watchLater.items){
                    if (item.watchId === watchId){
                        callback(item.itemId)
                        return
                    }
                }
                if (watchLater.hasNext){
                    this.isWatchLater(callback,watchId,page + 1)
                }
            }
        }
        xhr.withCredentials = true
        xhr.setRequestHeader('X-Frontend-Id','6')
        xhr.setRequestHeader('X-Frontend-Version','0')
        xhr.setRequestHeader('X-Niconico-Language','ja-jp')
        xhr.send()
    }

    // TODO
    // static firstWatchLater(callback,page= 1){
    //     const xhr = new XMLHttpRequest()
    //     xhr.open('GET', 'https://nvapi.nicovideo.jp/v1/users/me/watch-later?sortKey=addedAt&sortOrder=desc&pageSize=100&page=1')
    //     xhr.onreadystatechange = ()=>{
    //         if (xhr.readyState === 4 && xhr.status === 200) {
    //             const json = JSON.parse(xhr.response)
    //             const watchLater = json['data']['watchLater']
    //             for (const item of watchLater['items']){
    //                 if (item['watchId'] === watchId){
    //                     callback(item['itemId'])
    //                 }
    //             }
    //             if (watchLater['hasNext'].toString() === 'true'){
    //                 this.isWatchLater(callback,watchId,page + 1)
    //             }
    //         }
    //     }
    //     xhr.withCredentials = true
    //     xhr.setRequestHeader('X-Frontend-Id','6')
    //     xhr.setRequestHeader('X-Frontend-Version','0')
    //     xhr.setRequestHeader('X-Niconico-Language','ja-jp')
    //     xhr.send()
    // }
}
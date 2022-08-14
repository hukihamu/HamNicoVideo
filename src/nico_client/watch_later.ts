type WatchLaterType = {
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
    add(watchId: string,
        wait: () => void,
        succeed: () => void,
        failed: () => void,
        error: () => void) {
        fetch('https://nvapi.nicovideo.jp/v1/users/me/watch-later?watchId={watchId}'
                .replace('{watchId}', watchId),
            {
                method: 'post',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'X-Frontend-Id': '6',
                    'X-Frontend-Version': '0',
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'X-Request-With': 'https://www.nicovideo.jp'
                }
            }).then(value => {
                switch (value.status) {
                    case 201: {
                        succeed()
                        break
                    }
                    case 409: {
                        failed()
                        break
                    }
                    default: {
                        error()
                        console.log('Failed. HttpStatus: ' + value.statusText)
                    }
                }
                setTimeout(wait, 5000)
            }
        )
    },
    remove(itemId: string, wait: () => void, succeed: () => void, failed: () => void) {
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
        xhr.setRequestHeader('X-Frontend-Id', '6')
        xhr.setRequestHeader('X-Frontend-Version', '0')
        xhr.setRequestHeader('X-Niconico-Language', 'ja-jp')
        xhr.setRequestHeader('X-Request-With', 'https://www.nicovideo.jp')
        xhr.send()
    },
    has(callback: (itemId: string) => void, watchId: string, page = 1) {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', `https://nvapi.nicovideo.jp/v1/users/me/watch-later?sortKey=addedAt&sortOrder=desc&pageSize=100&page=${page}`)
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const json: WatchLaterType = JSON.parse(xhr.response)
                const watchLater = json.data.watchLater
                for (const item of watchLater.items) {
                    if (item.watchId === watchId) {
                        callback(item.itemId)
                        return
                    }
                }
                if (watchLater.hasNext) {
                    this.has(callback, watchId, page + 1)
                }
            }
        }
        xhr.withCredentials = true
        xhr.setRequestHeader('X-Frontend-Id', '6')
        xhr.setRequestHeader('X-Frontend-Version', '0')
        xhr.setRequestHeader('X-Niconico-Language', 'ja-jp')
        xhr.send()
    }
}
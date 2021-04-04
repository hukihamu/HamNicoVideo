class WatchLater{
    static addWatchLater(watchId,wait,succeed,failed,error){
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
                clearTimeout(wait)
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
    }
}
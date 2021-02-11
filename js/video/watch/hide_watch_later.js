function hideWatchLater() {
    const watchLater = document.getElementsByClassName('ActionButton WatchLaterButton VideoMenuContainer-button')[0]
    watchLater.parentElement.remove()
}

function onRemoveWatchLater(){
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const json = JSON.parse(xhr.response)
            console.log(json)
        }
    }
    xhr.withCredentials = true
    xhr.open('GET', 'https://nvapi.nicovideo.jp/v1/users/me/watch-later?sortKey=addedAt&sortOrder=desc&pageSize=100&page=1')
    xhr.send()
//一覧 access-control-request-headers
//https://nvapi.nicovideo.jp/v1/users/me/watch-later?sortKey=addedAt&sortOrder=desc&pageSize=100&page=1

//Request Method: DELETE, Request Method: OPTIONS
//https://nvapi.nicovideo.jp/v1/users/me/watch-later?itemIds=1612792388
    //sessionstorage
    //element
}
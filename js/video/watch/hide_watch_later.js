function hideWatchLater() {
    const watchLater = document.getElementsByClassName('ActionButton WatchLaterButton VideoMenuContainer-button')[0]
    watchLater.parentElement.remove()
}
let wlButton
let wldButton

function watchId(){
    return  location.pathname.replace('/watch/','')
}

function setRemoveWatchLater() {
    if (!wlButton){
        wlButton = document.getElementsByClassName('ActionButton WatchLaterButton VideoMenuContainer-button')[0]
        const callback = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                const target = mutation.target
                if (target){
                    if (target.classList.contains('is-succeeded')) {
                        const waitFun = () => {
                            wldButton.style.display = 'block'
                            wlButton.style.display = 'none'
                        }
                        clearTimeout(waitFun)
                        setTimeout(waitFun, 5000)
                    }
                }
            }
        }
        new MutationObserver(callback).observe(wlButton, {
            attributes: true,
            attributeFilter: ['class']
        })
    }
    if (!wldButton){
        wldButton = wlButton.cloneNode(true)
        wldButton.style.display = 'none'
        wldButton.dataset['title'] = '「あとで見る」から削除'
        wldButton.classList.add('is-delete')
        wldButton.addEventListener('click',onRemoveWatchLater)
        wlButton.parentNode.appendChild(wldButton)
    }

    checkWatchLater(1)
}
function checkWatchLater(page){
    if (page > 5){
        return
    }
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const json = JSON.parse(xhr.response)
            const watchLater = json['data']['watchLater']
            for (const item of watchLater['items']){
                if (item['watchId'] === watchId()){
                    wldButton.style.display = 'block'
                    wlButton.style.display = 'none'
                    wldButton.dataset['itemId'] = item['itemId']
                    return
                }
            }
            if (watchLater['hasNext'].toString() === 'true'){
                checkWatchLater(page + 1)
            }else {
                wldButton.style.display = 'none'
                wlButton.style.display = 'block'
            }
        }
    }
    xhr.open('GET', 'https://nvapi.nicovideo.jp/v1/users/me/watch-later?sortKey=addedAt&sortOrder=desc&pageSize=100&page=' + page)
    xhr.withCredentials = true
    xhr.setRequestHeader('X-Frontend-Id','6')
    xhr.setRequestHeader('X-Frontend-Version','0')
    xhr.setRequestHeader('X-Niconico-Language','ja-jp')
    xhr.send()
}

function onRemoveWatchLater(){
    wldButton.classList.add(['is-busy'])
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            wldButton.classList.remove(['is-busy'])
            if (xhr.status === 200) {
                wldButton.classList.remove(['is-succeeded'])
                wldButton.classList.remove(['is-failed'])
                if (JSON.parse(xhr.response)['meta']['status'] === 200) {
                    wldButton.classList.add(['is-succeeded'])
                    wldButton.dataset['title'] = '「あとで見る」から削除しました'
                    //TODO session storageから消す
                } else {
                    wldButton.classList.add(['is-failed'])
                    wldButton.dataset['title'] = '「あとで見る」から削除に失敗'
                }
                const waitFun = () => {
                    wldButton.classList.remove(['is-succeeded'])
                    wldButton.classList.remove(['is-failed'])
                    wldButton.dataset['title'] = '「あとで見る」から削除'
                    wldButton.style.display = 'none'
                    wlButton.style.display = 'block'
                }
                clearTimeout(waitFun)
                setTimeout(waitFun, 5000)
            }
        }
    }
    xhr.open('DELETE', 'https://nvapi.nicovideo.jp/v1/users/me/watch-later?itemIds=' + wldButton.dataset['itemId'])
    xhr.withCredentials = true
    xhr.setRequestHeader('X-Frontend-Id','6')
    xhr.setRequestHeader('X-Frontend-Version','0')
    xhr.setRequestHeader('X-Niconico-Language','ja-jp')
    xhr.setRequestHeader('X-Request-With','https://www.nicovideo.jp')
    xhr.send()
}

//TODO あとでみるリスト playlist=eyJ0eXBlIjoid2F0Y2hsYXRlciIsImNvbnRleHQiOnsic29ydEtleSI6ImFkZGVkQXQiLCJzb3J0T3JkZXIiOiJkZXNjIn19
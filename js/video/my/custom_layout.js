function customLayout(item) {
    applyLayout(item)

    if (PARAMETER.VIDEO.REPO.CUSTOM_LAYOUT.HIGHLIGHT.ENABLE.pValue)
        applyHighlight(item)
}

function applyLayout(item) {
    item.firstChild.style.padding = '5px'
    item.style.marginTop = '8px'

    if (PARAMETER.VIDEO.REPO.CUSTOM_LAYOUT.ADD_WATCH_LATER.pValue){
        addWatchLater()
    }
}
function addWatchLater(){
    //後で見る
    if (item.getElementsByClassName('ContentLabel_video').length > 0){
        const button = document.createElement('button')
        button.className = 'WatchLaterButton-button'
        button.style.width = '24px'
        button.style.height = '24px'
        button.dataset.title = 'あとで見る'
        button.dataset.url = item.getElementsByClassName('NicorepoItem-content')[0].href
        button.addEventListener('click',onClickWatchLater)

        const div = document.createElement('div')
        div.className = 'WatchLaterButton'
        div.style.position = 'initial'
        div.style.marginRight = 0
        div.style.marginTop = 0
        div.style.marginBottom = 'auto'
        div.style.marginLeft = 'auto'
        div.appendChild(button)

        const sender = item.getElementsByClassName('NicorepoItem-sender')[0]
        sender.appendChild(div)
    }
}
function applyHighlight(item){
    const activityDescription = item.getElementsByClassName('NicorepoItem-activityDescription')[0]
    const result = MatcherPValue.elementMatchText(activityDescription.innerText, PARAMETER.VIDEO.REPO.CUSTOM_LAYOUT.HIGHLIGHT)
    if (result !== null) {
        item.firstChild.style.backgroundColor = result.pValue
    }
}

function onClickWatchLater(event){

    jsonApiData = JSON.parse(document.getElementById('js-initial-userpage-data').dataset['environment'])
    environment = {
        csrfToken: jsonApiData['csrfToken']
    }

    const target = event.target
    const url = target.dataset.url.replace('https://www.nicovideo.jp/watch/','')
    target.dataset.title = '更新中'
    target.classList.add('is-busy')

    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            target.classList.remove(['is-busy'])
            if (xhr.status === 200) {
                target.classList.remove(['is-succeeded'])
                target.classList.remove(['is-failed'])
                if (JSON.parse(xhr.response)['status'] == 'ok'){
                    target.classList.add(['is-succeeded'])
                    target.dataset['title'] = '「あとで見る」に追加しました'
                }else {
                    target.classList.add(['is-failed'])
                    target.dataset['title'] = 'すでに「あとで見る」に追加されています'
                }
                const waitFun = ()=>{
                    target.classList.remove(['is-succeeded'])
                    target.classList.remove(['is-failed'])
                    target.dataset['title'] = 'あとで見る'
                }
                clearTimeout(waitFun)
                setTimeout(waitFun,5000)
            } else {
                console.log('Failed. HttpStatus: ' + xhr.statusText)
            }
        }
    }
    xhr.withCredentials = true
    xhr.open('POST', 'https://www.nicovideo.jp/api/deflist/add')
    const formData = new FormData()
    formData.append('item_id', url)
    formData.append('description', '')
    formData.append('token', environment.csrfToken)
    xhr.send(formData)
}
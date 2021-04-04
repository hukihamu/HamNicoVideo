function customLayout(item) {
    applyLayout(item)

    if (PARAMETER.VIDEO.REPO.HIGHLIGHT.ENABLE.pValue)
        applyHighlight(item)
}

function applyLayout(item) {
    item.firstChild.style.padding = '5px'
    item.style.marginTop = '8px'

    if (PARAMETER.VIDEO.REPO.ADD_WATCH_LATER.pValue){
        addWatchLater(item)
    }
}
function addWatchLater(item){
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
    const result = MatcherPValue.elementMatchText(activityDescription.innerText, PARAMETER.VIDEO.REPO.HIGHLIGHT)
    if (result !== null) {
        item.firstChild.style.backgroundColor = result.pValue
    }
}

function onClickWatchLater(event){

    const target = event.target
    const url = target.dataset.url.replace('https://www.nicovideo.jp/watch/','')
    target.dataset.title = '更新中'

    WatchLater.addWatchLater(url, ()=>{
            target.classList.remove(['is-succeeded'])
            target.classList.remove(['is-failed'])
            target.dataset['title'] = 'あとで見る'
        }, ()=>{
            target.classList.add(['is-succeeded'])
            target.dataset['title'] = '「あとで見る」に追加しました'
        },()=>{
            target.classList.add(['is-failed'])
            target.dataset['title'] = 'すでに「あとで見る」に追加されています'
        },()=>{
            target.classList.add(['is-failed'])
            target.dataset['title'] = '「あとで見る」への追加に失敗'
        })
}
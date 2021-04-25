const ElementId = 'remove_watch_later_button'


function removeWatchLater() {
    const watchId = location.pathname.replace('/watch/','')

    const oldRWL = document.getElementById(ElementId)
    if (oldRWL) oldRWL.parentElement.remove()

    const callback = (itemId)=>{
        const buttonContainer = document.getElementsByClassName('VideoMenuContainer-areaLeft')[0]
        const div = document.createElement('div')
        div.className = 'ClickInterceptor LoginRequirer is-inline'
        buttonContainer.insertBefore(div,buttonContainer.children[1])

        const button = document.createElement('button')
        button.dataset['title'] = '「あとで見る」から削除'
        button.className = 'ActionButton WatchLaterButton VideoMenuContainer-button'
        button.id = ElementId
        button.type = 'button'
        button.dataset['itemId'] = itemId
        button.addEventListener('click',onRemoveWatchLater)
        div.appendChild(button)

        const svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        svg.setAttributeNS(null,'viewBox','0 0 24 24')
        svg.setAttributeNS(null,'fill-rule','evenodd')
        svg.setAttributeNS(null,'clip-rule','evenodd')
        svg.setAttributeNS(null,'stroke-linejoin','round')
        svg.setAttributeNS(null,'stroke-miterlimit','1.4')
        button.appendChild(svg)

        const path = document.createElementNS('http://www.w3.org/2000/svg','path')
        path.setAttributeNS(null,'d','M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm3.3-3.5l-4.2-3.1a.5.5 0 01-.2-.4V6.4c0-.3.2-.5.5-.5h1.2c.3 0 .5.2.5.5V12l3.6 2.6c.2.2.2.5 0 .7l-.7 1c-.1.3-.4.3-.7.1z')
        svg.appendChild(path)
    }
    WatchLater.isWatchLater(callback,watchId)
}

function onRemoveWatchLater(event){

    const target = event.target

    WatchLater.removeWatchLater(target.dataset['itemId'],
        ()=>{
        target.parentElement.remove()
        },()=>{
            target.classList.add(['is-succeeded'])
            target.dataset['title'] = '「あとで見る」から削除しました'
        },()=>{
            target.classList.add(['is-failed'])
            target.dataset['title'] = '「あとで見る」から削除に失敗'
        })
}
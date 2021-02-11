const watch = async function () {
    await BStorage.init()

    function adjustMylistArrow(){
        //1: 12 2: 48 3: 84
        const videoMenu = document.getElementsByClassName('GridCell col-fill VideoMenuContainer-areaLeft')[0]
        let px = 12
        let customIndex = -1
        let index = 0
        for (let i = 0; i < videoMenu.childElementCount;i++){
            const child = videoMenu.childNodes[i]
            if (child.firstChild.id === 'custom_mylist_button') customIndex = i
            if (child.firstChild.dataset['title'] === 'マイリスト'){
                index = i
                break
            }
        }
        const style = document.createElement('style')
        let styleText = '.AddingMylistPanelContainer:not(.custom-mylist):before{left: '+(index * 36 + px)+'px;}'
        if (customIndex !== -1){
            styleText += '.custom-mylist:before{left: '+(customIndex * 36 + px)+'px;}'
        }
        style.textContent = styleText
        videoMenu.appendChild(style)
    }
    function setOptionView(){

        const cardMain = document.createElement('div')
        cardMain.className = 'Card-main'
        cardMain.id = 'Ham-Card-main'

        const cardTitle = document.createElement('h1')
        cardTitle.className = 'Card-title'
        cardTitle.innerText = 'Hamオプション'
        const cardHeader = document.createElement('div')
        cardHeader.className = 'Card-header'
        cardHeader.appendChild(cardTitle)

        const card = document.createElement('div')
        card.className = 'Card'
        card.appendChild(cardHeader)
        card.appendChild(cardMain)
        const inView = document.createElement('div')
        inView.className = 'InView'
        inView.appendChild(card)

        const sideGrid = document.getElementsByClassName('GridCell BottomSideContainer')[0]
        sideGrid.prepend(inView)
    }

    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = browserInstance.runtime.getURL("css/nicovideo.css");
    document.head.appendChild(cssLink)



    if (PARAMETER.VIDEO.WATCH.HOLD_SETTING.ENABLE.pValue){
        holdSetting()
    }


    function loadEvent() {
        setOptionView()

        if (PARAMETER.VIDEO.WATCH.CUSTOM_MY_LIST.ENABLE.pValue){
            setCustomMyListButton()
        }
        if (PARAMETER.VIDEO.WATCH.HIDE_WATCH_LATER.pValue){
            hideWatchLater()
        }
        if (PARAMETER.VIDEO.WATCH.IS_HTTP_VIDEO.pValue){
            httpVideo()
        }

        adjustMylistArrow()
    }
    //TODO 見つからないケースあり
    const checkParentElement = document.getElementById('js-app')

    if (document.getElementsByClassName('VideoMenuContainer-areaLeft').length === 0){
        new MutationObserver((mutationsList,observer)=>{
            const areaLeft = document.getElementsByClassName('VideoMenuContainer-areaLeft')
            if (areaLeft.length > 0){
                loadEvent()
                observer.disconnect()
            }
        }).observe(checkParentElement, {
            subtree: true,
            childList: true
        })
    }
}


window.addEventListener('DOMContentLoaded', watch)

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


    let oh = function (){}
    if (PARAMETER.VIDEO.WATCH.HOLD_SETTING.ENABLE.pValue){
        holdSetting()
        oh = onHold
    }


    function loadEvent() {

        setOptionView()

        if (PARAMETER.VIDEO.WATCH.CUSTOM_MY_LIST.ENABLE.pValue){
            setCustomMyListButton()
        }

        adjustMylistArrow()
        let cwl = function (){}
        if (PARAMETER.VIDEO.WATCH.REMOVE_WATCH_LATER.pValue){
            setRemoveWatchLater()
            cwl = checkWatchLater
        }

        //動画変更毎
        const thumbnail = document.getElementsByClassName('VideoPlayer')[0]
        if (thumbnail){
            new MutationObserver((mutationsList,observer)=>{
                for (const mutations of mutationsList){
                    if(mutations.target.className === 'VideoPlayer'){
                        cwl(1)
                        oh()

                    }
                }
            }).observe(thumbnail, {
                attributes: true
            })
        }
    }
    //TODO 見つからないケースあり 例：えらー画面
    const checkParentElement = document.getElementById('js-app')

    if (document.getElementsByClassName('VideoMenuContainer-areaLeft').length === 0){
        new MutationObserver((mutationsList,observer)=>{
            const areaLeft = document.getElementsByClassName('VideoMenuContainer-areaLeft')
            if (areaLeft.length > 0){
                observer.disconnect()
                loadEvent()
            }
        }).observe(checkParentElement, {
            subtree: true,
            childList: true
        })
    }


}
//TODO あとでみる表示？
// playlist=eyJ0eXBlIjoid2F0Y2hsYXRlciIsImNvbnRleHQiOnsic29ydEtleSI6ImFkZGVkQXQiLCJzb3J0T3JkZXIiOiJkZXNjIn19
window.addEventListener('DOMContentLoaded', watch)
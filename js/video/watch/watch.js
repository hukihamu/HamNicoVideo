const watch = async function () {
    await BStorage.init()

    //オプション欄
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

        const sideGrid = document.getElementsByClassName('BottomSideContainer')[0]
        sideGrid.prepend(inView)
    }

    //マイリスト選択の矢印
    function adjustMyListArrow(){
        const style = document.createElement('style')
        const videoMenu = document.getElementsByClassName('GridCell col-fill VideoMenuContainer-areaLeft')[0]
        const videoMenuX = videoMenu.getBoundingClientRect().left + window.pageXOffset - 6

        const myListButton = document.getElementById('add_my_list_button')
        const myListButtonX = myListButton.getBoundingClientRect().left + window.pageXOffset
        style.textContent = '.AddVideoListPanelContainer:not(.custom-mylist):before{left: '
            +(myListButtonX - videoMenuX)+'px;}'

        const customMyListButton = document.getElementById('custom_mylist_button')
        if (customMyListButton){
            const customMyListButtonX = customMyListButton.getBoundingClientRect().left + window.pageXOffset
            style.textContent += '.custom-mylist:before{left: '
                +(customMyListButtonX - videoMenuX)+'px;}'
        }

        videoMenu.appendChild(style)
    }


    let oh = function (){}
    if (PARAMETER.VIDEO.WATCH.HOLD_SETTING.ENABLE.pValue){
        holdSetting()
        oh = onHold
    }
    let rwl = function (){}
    if (PARAMETER.VIDEO.WATCH.REMOVE_WATCH_LATER.pValue){
        rwl = removeWatchLater
    }
    let scl = ()=>{}
    if (PARAMETER.VIDEO.WATCH.SHOW_COMMENT_LIST.pValue){
        scl = showCommentList
    }
    let wll = ()=>{}
    if (true){
        wll = watchLaterList
    }

    function onLoad(){
        setOptionView()
        // minimumLike()
        scl()
        wll()

        if (PARAMETER.VIDEO.WATCH.CUSTOM_MY_LIST.ENABLE.pValue){
            setCustomMyListButton()
        }
    }
    //動画変更毎
    function onVideoChange(){

        // const contentTree = document.getElementsByClassName('Link ContentTreeContainer-guideLink')[0]
        // console.log(contentTree.href)
        // if (contentTree.href){
        //
        // }
        const thumbnail = document.getElementsByClassName('VideoPlayer')[0]
        if (thumbnail){
            new MutationObserver((mutationsList)=>{
                for (const mutations of mutationsList){
                    const target = mutations.target
                    if (target.className === 'VideoPlayer'){
                        oh()
                        rwl()
                    }
                }
            }).observe(thumbnail, {
                attributes: true
            })
        }
    }
    let isArea = true
    let isTree = true
    const element = document.documentElement
    const y = element.scrollTop
    if (document.getElementsByClassName('VideoMenuContainer-areaLeft').length === 0) {
        new MutationObserver((mutationsList, observer) => {
            const areaLeft = document.getElementsByClassName('VideoMenuContainer-areaLeft')
            if (areaLeft.length > 0 && isArea) {
                observer.disconnect()
                isArea = false
                onLoad()
                onVideoChange()

                // element.scrollTop = element.scrollHeight - element.clientHeight;
            }
            // const bottomMain = document.getElementsByClassName('Card ContentTreeContainer')
            // if (bottomMain.length > 0 && isTree) {
            //     isTree = false
            //     onVideoChange()
            //
            //     element.scrollTop = y
            // }
            // if (!isArea && !isTree) observer.disconnect()
        }).observe(document.body, {
            subtree: true,
            childList: true
        })
    }
}
window.addEventListener('DOMContentLoaded', watch)
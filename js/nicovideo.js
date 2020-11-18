const nicovideo = async function () {
    await BrowserStorage.init()


    const jsonApiData = JSON.parse(document.getElementById('js-initial-watch-data').dataset['apiData'])
    const apiData = {
        thread_id: jsonApiData['video']['dmcInfo']['thread']['thread_id'],
        csrfToken: jsonApiData['context']['csrfToken']
    }

    class InitFunc{
        constructor(func,param,checker) {
            this.isRun = false
            this.param = param
            this.checker = checker
            this.func = func
        }
        checkRun(){
            if (this.param && !this.paramValue){
                //storage確認
                this.paramValue = BrowserStorage.get(this.param.key)
                if (!this.paramValue){
                    this.isRun = !this.paramValue
                    return !this.paramValue
                }
            }

            const temp =  this.checker()
            this.isRun = temp
            if (this.isRun) this.func()
            return temp
        }

        isCheck(){
            return this.isRun || this.checkRun()
        }
    }
    const initFunc = [
        new InitFunc(initExpOption,null,()=>document.getElementsByClassName('GridCell BottomSideContainer')[0]),
        new InitFunc(initHttpVideo,null,()=>document.getElementById('MainVideoPlayer')),
        new InitFunc(initDeleteWatchLater,OPTION_PARAM.NICOVIDEO.HIDE_WATCHLATER,()=>document.getElementsByClassName('ActionButton WatchLaterButton VideoMenuContainer-button')[0]),
        new InitFunc(initCustomMyListButton,null,()=>document.getElementsByClassName('VideoMenuContainer-areaLeft')[0]),
        new InitFunc(initContentsTree,null,()=>document.getElementById('contents_tree')),
        new InitFunc(initMylistArrow,null,()=>document.getElementsByClassName('GridCell col-fill VideoMenuContainer-areaLeft')[0]),
        new InitFunc(initDeleteShareButton,OPTION_PARAM.NICOVIDEO.HIDE_SHARE,()=>document.getElementsByClassName('GridCell col-1of12 VideoMenuContainer-areaRight')[0]),
        new InitFunc(initToolTip,OPTION_PARAM.NICOVIDEO.COMMENT_TOOLTIP,()=>document.getElementsByClassName('DataGrid-TableRow CommentPanelDataGrid-TableRow')[0]),
    ]
    function initElement(){
        let isInitComp = true
        for (let f of initFunc){
            isInitComp = f.isCheck() && isInitComp
        }
        return isInitComp
    }

    let CUSTOM_MYLIST_NAME = 'カスタムマイリスト'

    function initDeleteWatchLater() {
        const watchLater = document.getElementsByClassName('ActionButton WatchLaterButton VideoMenuContainer-button')[0]
        watchLater.parentElement.remove()
    }
    function initMylistArrow(){
        //1: 12 2: 48 3: 84
        const videoMenu = document.getElementsByClassName('GridCell col-fill VideoMenuContainer-areaLeft')[0]
        let px = 12
        for (let i = 0; i < videoMenu.childElementCount;i++){
            const child = videoMenu.childNodes[i]
            if (child.firstChild.dataset['title'] === 'マイリスト'){
                px += i * 36
                break
            }
        }
        const style = document.createElement('style')
        style.textContent = '.AddingMylistPanelContainer:not(.custom-mylist):before{left: '+px+'px;}'
        videoMenu.appendChild(style)
    }

    function initCustomMyListButton() {

        const buttonContainer = document.getElementsByClassName('VideoMenuContainer-areaLeft')[0]



        const div = document.createElement('div')
        div.className = 'ClickInterceptor LoginRequirer is-inline'
        buttonContainer.prepend(div)

        const myListIcon = document.getElementsByClassName('MylistIcon')[0]
        myListIcon.parentElement.id = 'add_my_list_button'
        const svg = myListIcon.cloneNode(true)
        svg.children[0].setAttribute('d','M22 0h22c.4 0 .8 0 1.1.2A8 8 0 0 1 51 4.9l3 7.1H92a8 8 0 0 1 8 8v56a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8h14zm48.2 53.4v-11a1.3 1.3 0 0 1 1.2-1.2h5.2a1.3 1.3 0 0 1 1.2 1.3v10.9h11a1.3 1.3 0 0 1 1.2 1.2v5.2a1.3 1.3 0 0 1-1.3 1.2H77.8v11a1.3 1.3 0 0 1-1.2 1.2h-5.2a1.3 1.3 0 0 1-1.2-1.3V61h-11a1.3 1.3 0 0 1-1.2-1.2v-5.2a1.3 1.3 0 0 1 1.3-1.2h10.9zM24')



        const button = document.createElement('button')
        button.id = 'custom_mylist_button'
        button.dataset['title'] = CUSTOM_MYLIST_NAME
        button.type = 'button'
        button.className = 'ActionButton VideoMenuContainer-button WatchLaterButton'
        button.onclick = resistCustomMyList
        button.appendChild(svg)
        div.appendChild(button)

        const settingButton = document.getElementById('custom_mylist_setting')
        settingButton.onclick = setCustomMylist

        //マイリスト名取得
        const xhr = new XMLHttpRequest()
        const mylistId = BrowserStorage.get(OPTION_PARAM.NICOVIDEO.CUSTOM_MYLIST.VALUE_CUSTOM_MYLIST.key)
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const mylists = JSON.parse(xhr.response)['data']['mylists']
                    for (let mylist of mylists){
                        if (mylist['id'] == mylistId){
                            CUSTOM_MYLIST_NAME = mylist['name']
                            button.dataset['title'] = CUSTOM_MYLIST_NAME
                            break
                        }
                    }
                } else {
                    console.log('Failed. HttpStatus: ' + xhr.statusText)
                }
            }
        }
        xhr.withCredentials = true
        xhr.open('GET', 'https://flapi.nicovideo.jp/api/watch/mylists?thread_id='+apiData.thread_id)
        xhr.send()
    }

    function resistCustomMyList(event) {
        const settingButton = event.target
        const mylistId = BrowserStorage.get(OPTION_PARAM.NICOVIDEO.CUSTOM_MYLIST.VALUE_CUSTOM_MYLIST.key)
        if (mylistId === OPTION_PARAM.NICOVIDEO.CUSTOM_MYLIST.VALUE_CUSTOM_MYLIST.default){
            //設定無し
            setCustomMylist()
        }else {

            settingButton.classList.add(['is-busy'])
            settingButton.dataset['title'] = '更新中'
            const xhr = new XMLHttpRequest()
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                        settingButton.classList.remove(['is-busy'])
                        if (xhr.status === 200) {

                            settingButton.classList.remove(['is-succeeded'])
                            settingButton.classList.remove(['is-failed'])
                            if (JSON.parse(xhr.response)['status'] == 'ok'){
                                settingButton.classList.add(['is-succeeded'])
                                settingButton.dataset['title'] = '「'+CUSTOM_MYLIST_NAME+'」に追加しました'
                            }else {
                                settingButton.classList.add(['is-failed'])
                                settingButton.dataset['title'] = 'すでに「'+CUSTOM_MYLIST_NAME+'」に追加されています'
                            }
                            const waitFun = ()=>{
                                settingButton.classList.remove(['is-succeeded'])
                                settingButton.classList.remove(['is-failed'])
                                settingButton.dataset['title'] = CUSTOM_MYLIST_NAME
                            }
                            clearTimeout(waitFun)
                            setTimeout(waitFun,5000)
                        } else {
                            console.log('Failed. HttpStatus: ' + xhr.statusText)
                        }
                }
            }
            xhr.withCredentials = true
            xhr.open('POST', 'https://www.nicovideo.jp/api/mylist/add')
            const formData = new FormData()
            formData.append('item_id', apiData.thread_id)
            formData.append('group_id', mylistId)
            formData.append('item_type', 0)
            formData.append('description', '')
            formData.append('item_amc', '')
            formData.append('token', apiData.csrfToken)
            xhr.send(formData)
        }
    }

    function setCustomMylist() {
        const myList = document.getElementById('add_my_list_button')
        const panel = document.getElementsByClassName('MainContainer-floatingPanel')[0]
        const callback = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                const addedNode = mutation.addedNodes[0]
                if (addedNode !== undefined) {
                    const panelEvent = (event) => {
                        const mylistNode = event.target.parentElement.parentElement
                        BrowserStorage.set(OPTION_PARAM.NICOVIDEO.CUSTOM_MYLIST.VALUE_CUSTOM_MYLIST.key, mylistNode.dataset['mylistId'])
                        CUSTOM_MYLIST_NAME = mylistNode.dataset['mylistName']
                        document.getElementById('custom_mylist_button').dataset['title'] = CUSTOM_MYLIST_NAME
                        //panel.firstChild.remove()
                        myList.click()
                        event.stopPropagation()
                    }
                    switch (addedNode.className) {
                        case 'FloatingPanelContainer is-visible':
                            const panelHeader = addedNode.getElementsByClassName('AddingMylistPanelContainer-header')[0]
                            panelHeader.innerText = panelHeader.innerText.replace('マイリストに登録', 'カスタムマイリストに設定')
                            panelHeader.parentElement.classList.add('custom-mylist')
                            const panelItems = addedNode.getElementsByClassName('AddingMylistPanel-item')
                            for (let item of panelItems) {
                                item.addEventListener('click', panelEvent, true)
                            }
                            break
                        case 'AddingMylistPanel-item':
                            addedNode.addEventListener('click', panelEvent, true)
                            break
                    }
                } else if (mutation.removedNodes[0].className === 'FloatingPanelContainer is-visible') {
                    observer.disconnect()
                }
            }
        }
        new MutationObserver(callback).observe(panel, {
            subtree: true,
            childList: true
        })
        myList.click()
        //便乗　表示時に上書き
    }

    function initDeleteShareButton() {
        const twitterButton = document.getElementsByClassName('TwitterShareButton')[0]
        twitterButton.remove()
        const facebookButton = document.getElementsByClassName('FacebookShareButton')[0]
        facebookButton.remove()
        const lineButton = document.getElementsByClassName('LineShareButton')[0]
        lineButton.remove()
    }



    function initHttpVideo() {
        //http_video_url
        const player = document.getElementById('MainVideoPlayer')
        const setSrc = (src) => {
            const httpVideo = document.getElementById('http_video_url')
            if (src.match('^https:') !== null) {
                httpVideo.href = src
                httpVideo.removeAttribute('title')
            } else {
                httpVideo.removeAttribute('href')
                httpVideo.title = '視聴方法がhttpではないため、利用できません。'
            }
        }
        if (player) {
            const firstChild = player.firstChild
            if (firstChild !== null) {
                setSrc(firstChild.src)
            }
            const callback = function (mutationsList) {
                for (let mutation of mutationsList) {
                    setSrc(mutation.target.src)
                }
            }
            new MutationObserver(callback).observe(player, {
                subtree: true,
                attributes: true,
                attributeFilter: ['src']
            })
        } else {
            console.error('MainVideoPlayerが見つかりません')
        }
    }

    function initContentsTree() {
        document.getElementById('contents_tree').href =
            'http://commons.nicovideo.jp/tree/' + location.href.substring(location.href.lastIndexOf('/') + 1)
    }

    //初期処理
    function initExpOption(){



        const httpVideoUrl = document.createElement('a')
        httpVideoUrl.id = 'http_video_url'
        httpVideoUrl.target= '_blank'
        httpVideoUrl.rel='noopener noreferrer'
        httpVideoUrl.innerText = 'HttpVideoURL'
        const contentsTree = document.createElement('a')
        contentsTree.id = 'contents_tree'
        contentsTree.target= '_blank'
        contentsTree.rel='noopener noreferrer'
        contentsTree.innerText = 'コンテンツツリー'
        const customMylistSetting = document.createElement('button')
        customMylistSetting.id = 'custom_mylist_setting'
        customMylistSetting.innerText = 'カスタムマイリスト設定'

        const cardMain = document.createElement('div')
        cardMain.className = 'Card-main'
        cardMain.appendChild(httpVideoUrl)
        cardMain.appendChild(document.createElement('br'))
        cardMain.appendChild(contentsTree)
        cardMain.appendChild(document.createElement('br'))
        cardMain.appendChild(customMylistSetting)


        const cardTitle = document.createElement('h1')
        cardTitle.className = 'Card-title'
        cardTitle.innerText = '拡張オプション'
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

        //css適用
        const hamStyle = document.createElement('link')
        hamStyle.rel = 'stylesheet'
        hamStyle.href = browserInstance.runtime.getURL("css/nicovideo.css");
        document.head.appendChild(hamStyle)
    }


    //nicovideoRun
    if (!initElement()){
        const checkParentElement = document.getElementById('js-app')

        new MutationObserver((mutationsList,observer)=>{
            if (initElement()){
                observer.disconnect()
            }
        }).observe(checkParentElement, {
            subtree: true,
            childList: true
        })
    }

    function initToolTip() {
        const tooltipInner = document.createElement('div')
        tooltipInner.className = 'Tooltip-inner'

        const tooltip = document.createElement('div')
        tooltip.id = 'comment_tooltip'
        tooltip.className = 'Tooltip top'
        tooltip.style.opacity = 0
        tooltip.style.visibility = 'hidden'
        tooltip.style.setProperty('transition','opacity 0.4s ease 0s')
        tooltip.appendChild(tooltipInner)
        document.body.appendChild(tooltip)

        setTooltip()

        //追加されるCommentにもListener追加
        new MutationObserver((mutationsList,observer)=>{
            for (let mutation of mutationsList){
                const t = mutation.target
                if (t.className !== 'DataGrid-Table CommentPanelDataGrid-Table'){
                    setTooltip()
                }
            }
        }).observe(document.getElementsByClassName('PlayerPanelContainer-content')[0], {
            subtree: true,
            childList: true
        })
    }
    function setTooltip() {
        const table = document.getElementsByClassName('DataGrid-TableRow CommentPanelDataGrid-TableRow')
        const commentList = []
        for (let row of table){
            for (let child of row.childNodes){
                if (child.dataset['name'] === 'content'){
                    commentList.push(child)
                    break
                }
            }
        }
        for (let comment of commentList){
            if (!comment.onmouseenter){
                const title = comment.parentElement.title
                comment.parentElement.title = ''
                comment.onmouseenter = (event)=>{
                    const temp = document.getElementById('comment_tooltip')
                    if (temp.firstChild.innerText !== title){
                        temp.firstChild.innerText = title
                        temp.style.opacity = 1
                        temp.style.visibility = 'visible'
                        const clientRect = event.target.getBoundingClientRect() ;
                        temp.style.top = window.pageYOffset +clientRect.top - temp.clientHeight - 5 + 'px'
                        const left = window.pageXOffset +clientRect.left + event.target.clientWidth - temp.clientWidth
                        temp.style.left = (0 <= left)? left + 'px' : '0'
                    }
                }
                comment.onmouseleave = ()=>{
                    const temp = document.getElementById('comment_tooltip')
                    temp.firstChild.innerText = ''
                    temp.style.opacity = 0
                    temp.style.visibility = 'hidden'
                }
            }
        }
    }

    /*nico storage処理
    let href = location.href
    new MutationObserver((mutationsList,observer)=>{
        if (location.href !== href){
            //処理

            href = location.href
        }
    }).observe(document, {
        subtree: true,
        childList: true
    })*/
}

window.onload = nicovideo

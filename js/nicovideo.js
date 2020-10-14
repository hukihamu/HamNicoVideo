const nicovideo = async function () {
    await ChromeStorage.init()


    const jsonApiData = JSON.parse(document.getElementById('js-initial-watch-data').dataset['apiData'])
    const apiData = {
        thread_id: jsonApiData['video']['dmcInfo']['thread']['thread_id'],
        csrfToken: jsonApiData['context']['csrfToken']
    }

    function checkElement(checker,init,checkParentElement){
        if (!checkParentElement) checkParentElement = document.getElementById('js-app')
        if (checker()){
            init()
            return
        }
        new MutationObserver((mutationsList,observer)=>{
            let isFound = false
                if (checker()){
                    observer.disconnect()
                    isFound = true
            }
            if (isFound) init()
        }).observe(checkParentElement, {
            subtree: true,
            childList: true
        })

    }

    function initInView() {
        checkElement(
            ()=>{return document.getElementById('MainVideoPlayer')},
            initHttpVideo
        )
        initContentsTree()
        if (ChromeStorage.get(OPTION_PARAM.NICOVIDEO.HIDE_SHARE.key))checkElement(
            ()=>{
                const temp = document.getElementsByClassName('GridCell col-1of12 VideoMenuContainer-areaRight')[0]
                return temp && temp.childElementCount >= 4
            },
            initDeleteShareButton)
        if (ChromeStorage.get(OPTION_PARAM.NICOVIDEO.HIDE_WATCHLATER.key)) checkElement(
            ()=>{return document.getElementsByClassName('ActionButton WatchLaterButton VideoMenuContainer-button')[0] !== undefined},
            initDeleteWatchLater
        )
        checkElement(
            ()=>{return document.getElementsByClassName('VideoMenuContainer-areaLeft')[0] !== undefined},
            initCustomMyListButton
        )
        checkElement(
            ()=>{return document.getElementsByClassName('GridCell col-fill VideoMenuContainer-areaLeft')[0] !== undefined},
            initMylistArrow
        )

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
        const styleText = '.AddingMylistPanelContainer:before{left: '+px+'px;}'
        const styleTag = document.getElementById('ham-style')
        styleTag.innerHTML = styleText + styleTag.innerHTML
    }

    function initCustomMyListButton() {

        const buttonContainer = document.getElementsByClassName('VideoMenuContainer-areaLeft')[0]


        // const myListStyle = document.createElement('style')
        // myListStyle.type = 'text/css'
        // myListStyle.innerHTML = '.AddingMylistPanelContainer:before{left: 84px;}'
        // document.head.appendChild(myListStyle)

        const div = document.createElement('div')
        div.className = 'ClickInterceptor LoginRequirer is-inline'
        buttonContainer.prepend(div)

        const myListIcon = document.getElementsByClassName('MylistIcon')[0]
        myListIcon.parentElement.id = 'add_my_list_button'
        const svg = myListIcon.cloneNode()
        svg.innerHTML += '<path d="M22 0h22c.4 0 .8 0 1.1.2A8 8 0 0 1 51 4.9l3 7.1H92a8 8 0 0 1 8 8v56a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8h14zm48.2 53.4v-11a1.3 1.3 0 0 1 1.2-1.2h5.2a1.3 1.3 0 0 1 1.2 1.3v10.9h11a1.3 1.3 0 0 1 1.2 1.2v5.2a1.3 1.3 0 0 1-1.3 1.2H77.8v11a1.3 1.3 0 0 1-1.2 1.2h-5.2a1.3 1.3 0 0 1-1.2-1.3V61h-11a1.3 1.3 0 0 1-1.2-1.2v-5.2a1.3 1.3 0 0 1 1.3-1.2h10.9zM24"></path>'

        const button = document.createElement('button')
        button.id = 'custom_mylist_button'
        button.dataset['title'] = CUSTOM_MYLIST_NAME
        button.type = 'button'
        button.className = 'ActionButton VideoMenuContainer-button WatchLaterButton'
        button.onclick = resistCustomMyList
        button.appendChild(svg)
        div.appendChild(button)

        const settingButton = document.getElementById('custom_mulist_setting')
        settingButton.onclick = setCustomMylist

        //マイリスト名取得
        const xhr = new XMLHttpRequest()
        const mylistId = ChromeStorage.get(OPTION_PARAM.NICOVIDEO.CUSTOM_MYLIST.VALUE_CUSTOM_MYLIST.key)
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
        const mylistId = ChromeStorage.get(OPTION_PARAM.NICOVIDEO.CUSTOM_MYLIST.VALUE_CUSTOM_MYLIST.key)
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
                            setTimeout(waitFun,8000)
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
                        ChromeStorage.set(OPTION_PARAM.NICOVIDEO.CUSTOM_MYLIST.VALUE_CUSTOM_MYLIST.key, mylistNode.dataset['mylistId'])
                        CUSTOM_MYLIST_NAME = mylistNode.dataset['mylistName']
                        document.getElementById('custom_mylist_button').dataset['title'] = CUSTOM_MYLIST_NAME
                        //panel.firstChild.remove()
                        myList.click()
                        event.stopPropagation()
                    }
                    switch (addedNode.className) {
                        case 'FloatingPanelContainer is-visible':
                            const panelHeader = addedNode.getElementsByClassName('AddingMylistPanelContainer-header')[0]
                            panelHeader.innerHTML = panelHeader.innerHTML.replace('マイリストに登録', 'カスタムマイリストに設定')
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
    function setExpOption(){
        const expOption =
            '<div class="Card">' +
            '   <div class="Card-header">' +
            '       <h1 class="Card-title">拡張オプション</h1>' +
            '   </div>' +
            '   <div class="Card-main">' +
            '       <style id="ham-style">' +
            '           #contents_tree{' +
            '               display: block;' +
            '               background-image: url(http://commons.nicovideo.jp/images/common/button/btn_tree_min.png);' +
            '               text-indent: -9999px;' +
            '               width: 102px;' +
            '               height: 18px;' +
            '               ' +
            '           }' +
            '           #contents_tree:hover{' +
            '               background-position: 0 -18px;' +
            '           }' +
            '           .custom-mylist:before{' +
            '               left: 12px;' +
            '           }' +
            '       </style>' +
            '       <a id="http_video_url" target="_blank" rel="noopener noreferrer">HttpVideoURL</a><br>' +
            '       <a id="contents_tree" target="_blank" rel="noopener noreferrer">コンテンツツリー</a><br>' +
            '       <button id="custom_mulist_setting" >カスタムマイリスト設定</button>' +
            '   </div>' +
            '</div>'
        const inView = document.createElement('div')
        inView.className = 'InView'
        inView.innerHTML = expOption

        //document.body.innerHTML += expStyle

        const sideGrid = document.getElementsByClassName('GridCell BottomSideContainer')[0]
        sideGrid.prepend(inView)
        initInView()
    }

    checkElement(
        ()=>{return document.getElementsByClassName('GridCell BottomSideContainer')[0] !== undefined},
        setExpOption
    )
}

window.onload = nicovideo

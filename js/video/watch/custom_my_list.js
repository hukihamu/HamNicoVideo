let CUSTOM_MYLIST_NAME = 'カスタムマイリスト'



function setCustomMyListButton() {

    const buttonContainer = document.getElementsByClassName('VideoMenuContainer-areaLeft')[0]


    const div = document.createElement('div')
    div.className = 'ClickInterceptor LoginRequirer is-inline'
    buttonContainer.insertBefore(div,buttonContainer.children[1])

    const myListIcon = document.getElementsByClassName('MylistIcon')[0]
    myListIcon.parentElement.id = 'add_my_list_button'
    const svg = myListIcon.cloneNode(true)
    svg.children[0].setAttribute('d','M22 0h22c.4 0 .8 0 1.1.2A8 8 0 0151 4.9l3 7.1H92a8 8 0 018 8v56a8 8 0 01-8 8H8a8 8 0 01-8-8V8a8 8 0 018-8h14zm48.2 53.4v-11a1.3 1.3 0 011.2-1.2h5.2a1.3 1.3 0 011.2 1.3v10.9h11a1.3 1.3 0 011.2 1.2v5.2a1.3 1.3 0 01-1.3 1.2H77.8v11a1.3 1.3 0 01-1.2 1.2h-5.2a1.3 1.3 0 01-1.2-1.3V61h-11a1.3 1.3 0 01-1.2-1.2v-5.2a1.3 1.3 0 011.3-1.2h10.9zM24 61.2v-8')



    const button = document.createElement('button')
    button.id = 'custom_mylist_button'
    button.dataset['title'] = CUSTOM_MYLIST_NAME
    button.type = 'button'
    button.className = 'ActionButton VideoMenuContainer-button'
    button.onclick = onClickCustomMyList
    button.appendChild(svg)
    div.appendChild(button)


    const customMyListSetting = document.createElement('button')
    customMyListSetting.id = 'custom_mylist_setting'
    customMyListSetting.innerText = 'カスタムマイリスト設定'
    customMyListSetting.onclick = setCustomMyListId
    document.getElementById('Ham-Card-main').appendChild(customMyListSetting)

    const myListId = PARAMETER.VIDEO.WATCH.CUSTOM_MY_LIST.MY_LIST_ID.pValue
    //マイリスト名取得
    if (myListId !== PARAMETER.VIDEO.WATCH.CUSTOM_MY_LIST.MY_LIST_ID.default){
        const xhr = new XMLHttpRequest()

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const myLists = JSON.parse(xhr.response)['data']['mylists']
                    for (let myList of myLists){
                        if (myList['id'].toString() === myListId.toString()){
                            CUSTOM_MYLIST_NAME = myList['name']
                            button.dataset['title'] = CUSTOM_MYLIST_NAME
                            break
                        }
                    }
                } else {
                    console.log('Failed. HttpStatus: ' + xhr.statusText)
                }
            }
        }
        xhr.open('GET', 'https://nvapi.nicovideo.jp/v1/users/me/mylists')
        xhr.withCredentials = true
        xhr.setRequestHeader('X-Frontend-Id','6')
        xhr.setRequestHeader('X-Frontend-Version','0')
        xhr.setRequestHeader('X-Niconico-Language','ja-jp')
        xhr.setRequestHeader('X-Request-With','https://www.nicovideo.jp')
        xhr.send()
    }
}

function onClickCustomMyList(event) {


    const settingButton = event.target
    const myListId = PARAMETER.VIDEO.WATCH.CUSTOM_MY_LIST.MY_LIST_ID.pValue.toString()
    if (myListId === PARAMETER.VIDEO.WATCH.CUSTOM_MY_LIST.MY_LIST_ID.default.toString()){
        //設定無し
        setCustomMyListId()
    }else {
        settingButton.classList.add(['is-busy'])
        settingButton.dataset['title'] = '更新中'
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                settingButton.classList.remove(['is-busy'])

                settingButton.classList.remove(['is-succeeded'])
                settingButton.classList.remove(['is-failed'])
                switch (xhr.status){
                    case 200:{
                        settingButton.classList.add(['is-failed'])
                        settingButton.dataset['title'] = 'すでに「'+CUSTOM_MYLIST_NAME+'」に追加されています'
                        break
                    }
                    case 201:{
                        settingButton.classList.add(['is-succeeded'])
                        settingButton.dataset['title'] = '「'+CUSTOM_MYLIST_NAME+'」に追加しました'
                        break
                    }
                    default:{
                        settingButton.classList.add(['is-failed'])
                        settingButton.dataset['title'] = '「'+CUSTOM_MYLIST_NAME+'」へ追加に失敗'
                        console.log('Failed. HttpStatus: ' + xhr.statusText)
                    }
                }
                const waitFun = ()=>{
                    settingButton.classList.remove(['is-succeeded'])
                    settingButton.classList.remove(['is-failed'])
                    settingButton.dataset['title'] = CUSTOM_MYLIST_NAME
                }
                clearTimeout(waitFun)
                setTimeout(waitFun,5000)
            }
        }
        xhr.withCredentials = true
        xhr.open('POST', 'https://nvapi.nicovideo.jp/v1/users/me/mylists/{myListId}/items?itemId={itemId}&description='
            .replace('{myListId}',myListId)
            .replace('{itemId}',watchId()))
        xhr.setRequestHeader('X-Frontend-Id','6')
        xhr.setRequestHeader('X-Frontend-Version','0')
        xhr.setRequestHeader('X-Niconico-Language','ja-jp')
        xhr.setRequestHeader('X-Request-With','https://www.nicovideo.jp')
        xhr.send()
    }
}

function setCustomMyListId() {
    const myList = document.getElementById('add_my_list_button')
    const panel = document.getElementsByClassName('MainContainer-floatingPanel')[0]
    if (panel.firstChild && !panel.firstChild.firstChild.classList.contains('custom-mylist')){
        myList.click()
    }

    const callback = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
            const addedNode = mutation.addedNodes[0]
            if (addedNode !== undefined) {
                const panelEvent = (event) => {
                    let myListNode = event.target
                    let i
                    for (i = 0; !myListNode.dataset['mylistId'] && i < 5; i++){
                        myListNode = myListNode.parentElement
                    }
                    //TODO iで警告を？
                    PARAMETER.VIDEO.WATCH.CUSTOM_MY_LIST.MY_LIST_ID.pValue = myListNode.dataset['mylistId']
                    CUSTOM_MYLIST_NAME = myListNode.dataset['mylistName']
                    document.getElementById('custom_mylist_button').dataset['title'] = CUSTOM_MYLIST_NAME
                    myList.click()
                    event.stopPropagation()
                }
                switch (addedNode.className) {
                    case 'FloatingPanelContainer is-visible':
                        const panelHeader = addedNode.getElementsByClassName('AddVideoListPanelContainer-header')[0]
                        panelHeader.innerText = panelHeader.innerText.replace('リストに登録', 'カスタムマイリストに設定')
                        panelHeader.parentElement.classList.add('custom-mylist')

                        const inner = addedNode.getElementsByClassName('AddVideoListPanel-inner')[0]
                        inner.firstChild.remove()
                        const panelItems = inner.getElementsByClassName('AddVideoListPanel-item')
                        for (let item of panelItems) {
                            item.addEventListener('click', panelEvent, true)
                        }
                        break
                    case 'AddVideoListPanel-item':
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
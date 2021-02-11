let CUSTOM_MYLIST_NAME = 'カスタムマイリスト'

let jsonApiData
let apiData

function setCustomMyListButton() {

    jsonApiData = JSON.parse(document.getElementById('js-initial-watch-data').dataset['apiData'])
    apiData = {
        thread_id: jsonApiData['video']['dmcInfo']['thread']['thread_id'],
        csrfToken: jsonApiData['context']['csrfToken']
    }

    const buttonContainer = document.getElementsByClassName('VideoMenuContainer-areaLeft')[0]


    const div = document.createElement('div')
    div.className = 'ClickInterceptor LoginRequirer is-inline'
    buttonContainer.prepend(div)

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
    customMyListSetting.onclick = setCustomMylistId
    document.getElementById('Ham-Card-main').appendChild(customMyListSetting)

    const mylistId = PARAMETER.VIDEO.WATCH.CUSTOM_MY_LIST.MY_LIST_ID.pValue
    //マイリスト名取得
    if (mylistId !== PARAMETER.VIDEO.WATCH.CUSTOM_MY_LIST.MY_LIST_ID.default){
        const xhr = new XMLHttpRequest()

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
}
function onClickCustomMyList(event) {


    const settingButton = event.target
    const mylistId = PARAMETER.VIDEO.WATCH.CUSTOM_MY_LIST.MY_LIST_ID.pValue
    if (mylistId === PARAMETER.VIDEO.WATCH.CUSTOM_MY_LIST.MY_LIST_ID.default){
        //設定無し
        setCustomMylistId()
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
function setCustomMylistId() {
    const myList = document.getElementById('add_my_list_button')
    const panel = document.getElementsByClassName('MainContainer-floatingPanel')[0]
    const callback = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
            const addedNode = mutation.addedNodes[0]
            if (addedNode !== undefined) {
                const panelEvent = (event) => {
                    const mylistNode = event.target.parentElement.parentElement
                    PARAMETER.VIDEO.WATCH.CUSTOM_MY_LIST.MY_LIST_ID.pValue = mylistNode.dataset['mylistId']
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
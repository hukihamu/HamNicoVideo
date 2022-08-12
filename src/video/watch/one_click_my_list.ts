// 1ボタンでマイリス登録できるやつ
import {OnSetCardGrid} from '@/video/type_on_set';
import storage from '@/storage';
import {myList} from '@/nico_client/my_list';

const DEFAULT_MY_LIST_NAME = '1クリックマイリスト'

let currentMyListId = ''
let currentMyListName = DEFAULT_MY_LIST_NAME

export const onSetOneClickMyList = {
    init: ()=>{
        const buttonContainer = document.getElementsByClassName('VideoMenuContainer-areaLeft')[0]

        const div = document.createElement('div')
        div.className = 'ClickInterceptor LoginRequirer is-inline'
        buttonContainer.insertBefore(div, buttonContainer.children[1])

        const myListIcon = document.getElementsByClassName('MylistIcon')[0]
        myListIcon.parentElement.id = 'add_my_list_button'
        const svg = myListIcon.cloneNode(true) as HTMLElement
        svg.children[0].setAttribute('d', 'M22 0h22c.4 0 .8 0 1.1.2A8 8 0 0151 4.9l3 7.1H92a8 8 0 018 8v56a8 8 0 01-8 8H8a8 8 0 01-8-8V8a8 8 0 018-8h14zm48.2 53.4v-11a1.3 1.3 0 011.2-1.2h5.2a1.3 1.3 0 011.2 1.3v10.9h11a1.3 1.3 0 011.2 1.2v5.2a1.3 1.3 0 01-1.3 1.2H77.8v11a1.3 1.3 0 01-1.2 1.2h-5.2a1.3 1.3 0 01-1.2-1.3V61h-11a1.3 1.3 0 01-1.2-1.2v-5.2a1.3 1.3 0 011.3-1.2h10.9zM24 61.2v-8')


        const button = document.createElement('button')
        button.id = 'one_click_my_list_button'
        button.dataset['title'] = currentMyListName
        button.type = 'button'
        button.className = 'ActionButton VideoMenuContainer-button'
        button.addEventListener('click',onAddMyList)
        button.appendChild(svg)
        div.appendChild(button)

        //マイリスト名取得
        const myListId = storage.get('Video_Watch_OneClickMyList').textValue
        if (myListId && currentMyListId !== myListId){
            myList.getMyListName(currentMyListId).then((myListName)=>{
                if (myListName){
                    currentMyListId = myListId
                    button.dataset['title'] = myListName
                    currentMyListName = myListName
                }
            })
        }
    },
    cardGrid: (grid, createGridCell)=>{
        const customMyListSetting = document.createElement('button')
        customMyListSetting.id = 'custom_mylist_setting'
        customMyListSetting.textContent = '1クリックマイリスト設定'
        customMyListSetting.addEventListener('click', onSettingMyList)
        const cell = createGridCell(grid, true)
        cell.appendChild(customMyListSetting)
    }
} as {init: ()=>void, cardGrid: OnSetCardGrid}


const onAddMyList = (event: MouseEvent)=>{
    const settingButton = event.target as HTMLButtonElement
    if (currentMyListId) {
        settingButton.classList.add('is-busy')
        settingButton.dataset['title'] = '更新中'
        const videoId = location.pathname.replace('/watch/', '')
        myList.addMyList(currentMyListId, videoId).then((resp)=>{
            settingButton.classList.remove('is-busy')
            settingButton.classList.remove('is-succeeded')
            settingButton.classList.remove('is-failed')
            switch (resp.status) {
                case 200: {
                    settingButton.classList.add('is-failed')
                    settingButton.dataset['title'] = 'すでに「' + currentMyListName + '」に追加されています'
                    break
                }
                case 201: {
                    settingButton.classList.add('is-succeeded')
                    settingButton.dataset['title'] = '「' + currentMyListName + '」に追加しました'
                    break
                }
                default: {
                    settingButton.classList.add('is-failed')
                    settingButton.dataset['title'] = '「' + currentMyListName + '」へ追加に失敗'
                    console.error(resp.statusText)
                    break
                }
            }
            //5秒間表示
            setTimeout(()=>{
                settingButton.classList.remove('is-succeeded')
                settingButton.classList.remove('is-failed')
                settingButton.dataset['title'] = currentMyListName
            }, 5000)
        })
    } else {
        //設定無し 設定画面を開く
        onSettingMyList()
    }
}

const onSettingMyList = ()=>{
    //既存の表示に便乗　表示時に上書き
    const myList = document.getElementById('add_my_list_button')
    const panel = document.getElementsByClassName('MainContainer-floatingPanel')[0]
    if (panel.firstChild && !(panel.firstChild.firstChild as HTMLElement).classList.contains('custom-mylist')) {
        myList.click()
    }
    const onMyListPanelEvent = (event: MouseEvent) => {
        event.stopPropagation()
        let myListNode = event.target as HTMLElement
        for (let i = 0; !myListNode.dataset['mylistId'] && i < 5; i++) {
            myListNode = myListNode.parentElement
        }
        currentMyListId = myListNode.dataset['mylistId']
        currentMyListName = myListNode.dataset['mylistName']
        const pv = storage.get('Video_Watch_OneClickMyList')
        pv.textValue = currentMyListId
        storage.set('Video_Watch_OneClickMyList', pv)
        document.getElementById('one_click_my_list_button').dataset['title'] = currentMyListName
        myList.click()
    }

    const callback: MutationCallback = (mutationsList, observer)=> {
        for (let mutation of mutationsList) {
            const addedNode = mutation.addedNodes[0] as HTMLElement
            if (addedNode !== undefined) {
                switch (addedNode.className) {
                    case 'FloatingPanelContainer is-visible':
                        const panelHeader = addedNode.getElementsByClassName('AddVideoListPanelContainer-header')[0] as HTMLElement
                        panelHeader.innerText = panelHeader.innerText.replace('リストに登録', '1クリックマイリストに設定')
                        panelHeader.parentElement.classList.add('custom-mylist')

                        const inner = addedNode.getElementsByClassName('AddVideoListPanel-inner')[0]
                        inner.firstChild.remove()
                        const panelItems = Array.from(inner.getElementsByClassName('AddVideoListPanel-item'))
                        for (let item of panelItems) {
                            item.addEventListener('click', onMyListPanelEvent, true)
                        }
                        break
                    case 'AddVideoListPanel-item':
                        addedNode.addEventListener('click', onMyListPanelEvent, true)
                        break
                }
            } else if ((mutation.removedNodes[0] as HTMLElement).className === 'FloatingPanelContainer is-visible') {
                observer.disconnect()
            }
        }
    }
    new MutationObserver(callback).observe(panel, {
        subtree: true,
        childList: true
    })
    myList.click()

}
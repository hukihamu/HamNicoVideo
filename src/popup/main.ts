import connection from '@/connection';
import {NotifyPostData} from '@/post_data/notify_post_data';
import {doc} from '@/window';
import util from '@/util';

export const popupMain = () => {
    document.getElementById('notification_edit')?.addEventListener('click', () => {
        window.location.href = '/html/popup_edit_notify.html?add'
    })
    connection.connect('list').then((resultValue) => {
        for (const viewData of resultValue) {
            createNotifyView(viewData)
        }
    })
}

const createNotifyView = (viewData: NotifyPostData) => {
    const body = document.getElementById('body')
    const parent = document.createElement('div')
    body?.appendChild(parent)
    createNotifyHeader(parent, viewData)
    createNotifyBody(parent, viewData)
    connection.connect('is_new_notify', viewData.valueId).then(isNewNotify =>{
        parent.classList.toggle('target-highlight', isNewNotify)
    })
}
const createNotifyBody = (parent: HTMLDivElement, viewData: NotifyPostData) => {
    const row = document.createElement('div')
    row.className = 'notification'
    parent.appendChild(row)


    const d1 = document.createElement('div')
    d1.className = 'NC-MediaObject NC-VideoMediaObject SeriesVideoListContainer-video'
    row.appendChild(d1)

    const d2 = document.createElement('div')
    d2.className = 'NC-MediaObject-main'
    d1.appendChild(d2)

    const a3 = document.createElement('a')
    a3.className = 'NC-Link NC-MediaObject-contents'
    a3.id = 'a3-' + viewData.valueId
    a3.rel = 'noopener'
    a3.target = '_blank'
    a3.addEventListener('click', () => {
        connection.connect('next', viewData.valueId).then( () => {
            // 既読
            connection.connect('read_notify', viewData.valueId).then(() => {})
        })
    })
    d2.appendChild(a3)

    const d4_1 = document.createElement('div')
    d4_1.className = 'NC-MediaObject-media'
    a3.appendChild(d4_1)

    const d5_1 = document.createElement('div')
    d5_1.className = 'NC-MediaObject-media'
    d4_1.appendChild(d5_1)

    const d6_1 = document.createElement('div')
    d6_1.className = 'NC-VideoMediaObject-thumbnail'
    d5_1.appendChild(d6_1)

    const d7_1 = document.createElement('div')
    d7_1.className = 'NC-NicoadFrame SeriesVideoListContainer-video'
    d6_1.appendChild(d7_1)

    const d8_1 = document.createElement('div')
    d8_1.className = 'NC-Thumbnail NC-VideoThumbnail NC-Thumbnail_sizeCover'
    d7_1.appendChild(d8_1)

    const d9_1 = document.createElement('div')
    d9_1.id = 'd9_1-' + viewData.valueId
    d9_1.className = 'NC-Thumbnail-image'
    d9_1.setAttribute('role', 'img')
    d8_1.appendChild(d9_1)

    const d9_2 = document.createElement('div')
    d9_2.className = 'NC-VideoPlaybackIndicator'
    d8_1.appendChild(d9_2)
    const d10_1 = document.createElement('div')
    d10_1.className = 'NC-VideoPlaybackIndicator-inner'
    const d9_3 = document.createElement('div')
    d9_3.id = 'd9_3-' + viewData.valueId
    d9_3.className = 'NC-VideoLength'

    d8_1.appendChild(d9_3)
    const d9_4 = document.createElement('div')
    d9_4.className = 'NC-VideoThumbnailComment'
    d8_1.appendChild(d9_4)


    const d4_2 = document.createElement('div')
    d4_2.className = 'NC-MediaObject-body'
    a3.appendChild(d4_2)

    const d5_2 = document.createElement('div')
    d5_2.className = 'NC-MediaObject-bodyTitle'
    d4_2.appendChild(d5_2)
    const h6_1 = document.createElement('h2')
    h6_1.className = 'NC-MediaObjectTitle NC-VideoMediaObject-title NC-MediaObjectTitle_fixed2Line'
    h6_1.id = 'h6_1-' + viewData.valueId
    d5_2.appendChild(h6_1)


    const d5_3 = document.createElement('div')
    d5_3.className = 'NC-MediaObject-bodySecondary'
    d4_2.appendChild(d5_3)

    const d6_2 = document.createElement('div')
    d6_2.className = 'NC-VideoMediaObject-description'
    d6_2.id = 'd6_2-' + viewData.valueId
    d5_3.appendChild(d6_2)

    const d6_3 = document.createElement('div')
    d6_3.className = 'NC-VideoMediaObject-meta'
    d5_3.appendChild(d6_3)

    const d7_2 = document.createElement('div')
    d7_2.className = 'NC-VideoMediaObject-metaAdditional'
    d6_3.appendChild(d7_2)

    const s8 = document.createElement('span')
    s8.className = 'NC-VideoRegisteredAtText'
    s8.id = 's8-' + viewData.valueId
    d7_2.appendChild(s8)
    const s9 = document.createElement('span')
    s9.className = 'NC-VideoRegisteredAtText-text'
    s8.appendChild(s9)
    const d8_2 = document.createElement('div')
    d8_2.className = 'NC-VideoLabels'
    d7_2.appendChild(d8_2)

    const d9_5 = document.createElement('div')
    d9_5.className = 'NC-VideoLabels-label NC-VideoLabels-channel hidden'
    d9_5.innerText = 'CH'
    d9_5.id = 'd9_5-' + viewData.valueId
    d8_2.appendChild(d9_5)

    const d9_6 = document.createElement('div')
    d9_6.className = 'NC-PremiumOnlyLabel SeriesVideoListContainer-video hidden'
    d9_6.id = 'd9_6-' + viewData.valueId
    d8_2.appendChild(d9_6)
    const s10_1 = document.createElement('span')
    s10_1.className = 'NC-PremiumOnlyLabel-icon'
    d9_6.appendChild(s10_1)
    const s10_2 = document.createElement('span')
    s10_2.innerText = '限定'
    d9_6.appendChild(s10_2)

    const d9_7 = document.createElement('div')
    d9_7.className = 'NC-VideoLabels-label NC-VideoLabels-paid hidden'
    d9_7.innerText = '有料'
    d9_7.id = 'd9_7-' + viewData.valueId
    d8_2.appendChild(d9_7)

    const d7_3 = document.createElement('div')
    d7_3.className = 'NC-VideoMediaObject-metaCount'
    d6_3.appendChild(d7_3)

    const d8_3 = document.createElement('div')
    d8_3.className = 'NC-VideoMetaCount NC-VideoMetaCount_view'
    d8_3.id = 'd8_3-' + viewData.valueId
    d7_3.appendChild(d8_3)
    const d8_4 = document.createElement('div')
    d8_4.className = 'NC-VideoMetaCount NC-VideoMetaCount_comment'
    d8_4.id = 'd8_4-' + viewData.valueId
    d7_3.appendChild(d8_4)
    const d8_5 = document.createElement('div')
    d8_5.className = 'NC-VideoMetaCount NC-VideoMetaCount_like'
    d8_5.id = 'd8_5-' + viewData.valueId
    d7_3.appendChild(d8_5)
    const d8_6 = document.createElement('div')
    d8_6.className = 'NC-VideoMetaCount NC-VideoMetaCount_mylist'
    d8_6.id = 'd8_6-' + viewData.valueId
    d7_3.appendChild(d8_6)

    // データ入力
    setNotifyData(parent, viewData.valueId)
}
const setNotifyData = (parent: HTMLDivElement, valueId: number) => {
    connection.connect('detail', valueId).then(videoDetail => {
        if (videoDetail) {
            doc.getElementById<HTMLAnchorElement>('a3-' + valueId).href = 'https://www.nicovideo.jp/watch/' + videoDetail.watchId
            const d9_1 = doc.getElementById('d9_1-' + valueId)
            d9_1.setAttribute('aria-label', videoDetail.title)
            d9_1.setAttribute('style', `background-image: url('${videoDetail.thumbnailUrl}.L');`) //サムネ
            let lengthText = ''
            const hour = Math.floor(videoDetail.length / 3600)
            const min = Math.floor(videoDetail.length % 3600 / 60);
            const sec = videoDetail.length % 60
            if (hour !== 0) {
                lengthText += hour + ':'
            }
            lengthText += min.toString().padStart(2, '0') + ':'
            lengthText += sec.toString().padStart(2, '0')
            doc.getElementById('d9_3-' + valueId).textContent = lengthText //動画時間
            doc.getElementById('h6_1-' + valueId).textContent = videoDetail.title// タイトル
            doc.getElementById('d6_2-' + valueId).innerHTML = videoDetail.description//動画説明
            const videoRegister = new Date(videoDetail.firstRetrieve)//投稿時間
            doc.getElementById('s8-' + valueId).textContent = `${videoRegister.getFullYear().toString().padStart(4, '0')}/${(videoRegister.getMonth() + 1).toString().padStart(2, '0')}/${videoRegister.getDate().toString().padStart(2, '0')} ${videoRegister.getHours().toString().padStart(2, '0')}:${videoRegister.getMinutes().toString().padStart(2, '0')}`
            if (videoDetail.isCH) {
                doc.getElementById('d9_5-' + valueId).classList.remove('hidden')//チャンネル
            }
            if (videoDetail.isPremiumOnly) {
                doc.getElementById('d9_6-' + valueId).classList.remove('hidden')//プレ限
            } else if (videoDetail.isPaid) {
                doc.getElementById('d9_7-' + valueId).classList.remove('hidden')//有料
            }

            doc.getElementById('d8_3-' + valueId).textContent = util.formatNumber(videoDetail.viewCounter)//再生数
            doc.getElementById('d8_4-' + valueId).textContent = util.formatNumber(videoDetail.commentNum)//コメント数
            doc.getElementById('d8_5-' + valueId).textContent = util.formatNumber(videoDetail.likeCounter)//いいね数
            doc.getElementById('d8_6-' + valueId).textContent = util.formatNumber(videoDetail.myListCounter)//マイリス数
            doc.getElementsByFirstClassName('notification', parent).classList.remove('invisible')

        } else {
            // 非表示
            doc.getElementsByFirstClassName('notification', parent).classList.add('invisible')
        }
    })
    parent.classList.remove('child-loading')
}

const createNotifyHeader = (parent: HTMLDivElement, viewData: NotifyPostData) => {
    const header = document.createElement('div')
    header.className = 'notify-header'

    //タイトル
    const targetTypeDiv = document.createElement('div')
    targetTypeDiv.className = 'target-type'
    const nameA = document.createElement('a')
    nameA.textContent = viewData.title
    nameA.href = viewData.titleLink
    nameA.target = '_blank'
    targetTypeDiv.appendChild(nameA)

    //操作
    const targetOperation = document.createElement('div')
    targetOperation.className = 'target-operation'

    //Next
    const nextButton = document.createElement('button')
    nextButton.innerText = 'Next'
    nextButton.className = 'next_button'
    nextButton.addEventListener('click', () => {
        parent.classList.add('child-loading')
        connection.connect('next', viewData.valueId).then( () => {
            setNotifyData(parent, viewData.valueId)
        })
    })

    //prev
    const prevButton = document.createElement('button')
    prevButton.innerText = 'Prev'
    prevButton.className = 'prev_button'
    prevButton.addEventListener('click', () => {
        parent.classList.add('child-loading')
        connection.connect('prev', viewData.valueId).then( () => {
            setNotifyData(parent, viewData.valueId)
        })
    })

    //既読
    const notifyRead = document.createElement('button')
    notifyRead.innerText = '既読'
    notifyRead.className = 'notify-read'
    notifyRead.addEventListener('click', () => {
        connection.connect('read_notify', viewData.valueId).then( () => {
            header.parentElement?.classList.toggle('target-highlight', false)
        })
    })
    //リフレッシュ
    const refreshButton = document.createElement('button')
    refreshButton.innerText = '新着確認'
    refreshButton.className = 'refresh'
    refreshButton.addEventListener('click', () => {
        parent.classList.toggle('child-loading', true)
        connection.connect('reload',viewData.valueId).then(isNewNotify =>{
            header.parentElement?.classList.toggle('target-highlight', isNewNotify)
            if (isNewNotify){
                // 新着があるため、再表示
                setNotifyData(parent, viewData.valueId)
            }else {
                parent.classList.toggle('child-loading', false)
            }
        })
    })


    //編集
    const editButton = document.createElement('button')
    editButton.innerText = '編集'
    editButton.className = 'edit_button'
    editButton.addEventListener('click', () => {
        window.location.href = '/html/popup_edit_notify.html?edit=' + viewData.valueId
    })

    const row1 = document.createElement('ul')
    row1.className = 'operation-row'
    const cell1 = document.createElement('li')
    cell1.appendChild(nextButton)
    const cell2 = document.createElement('li')
    cell2.appendChild(prevButton)
    row1.appendChild(cell1)
    row1.appendChild(cell2)
    const row2 = document.createElement('ul')
    row2.className = 'operation-row'
    const cell3 = document.createElement('li')
    cell3.appendChild(notifyRead)
    const cell4 = document.createElement('li')
    cell4.appendChild(refreshButton)
    const cell5 = document.createElement('li')
    cell5.appendChild(editButton)
    row2.appendChild(cell3)
    row2.appendChild(cell4)
    row2.appendChild(cell5)

    targetOperation.appendChild(row1)
    targetOperation.appendChild(row2)


    header.appendChild(targetTypeDiv)
    header.appendChild(targetOperation)
    parent.appendChild(header)
}
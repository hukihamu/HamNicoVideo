document.addEventListener('DOMContentLoaded', async () => {
    await BStorage.init()

    const onNextVideo = (child, seriesList, row)=>{
        for (const series of seriesList.children){
            series.style.display = "none"
        }
        let nextVideoId = null
        if (child.prevVideoId == null){
            seriesList.firstElementChild.style.display = ""
            const href = seriesList.firstElementChild.getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
            nextVideoId = href.substring(href.lastIndexOf("/")+1)
        } else {
            let lastIndex = 0
            for (const series of seriesList.children){
                const href = series.getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
                const videoID = href.substring(href.lastIndexOf("/")+1)
                if (videoID === child.prevVideoId){
                    break
                }
                lastIndex++
            }
            lastIndex++ //次の動画参照のため1追加
            const nextVideo = seriesList.children[lastIndex]
            if (nextVideo){
                nextVideo.style.display = ""
                const href = nextVideo.getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
                nextVideoId = href.substring(href.lastIndexOf("/")+1)
            }
        }
        row.dataset.videoId = nextVideoId
    }

    //シリーズ行
    const createSeriesRow = (notifyVideo)=>{
        const row = document.createElement('div')
        row.dataset.id = notifyVideo.notifyId

        //タイトル
        const targetTypeDiv = document.createElement('div')
        targetTypeDiv.className = 'target-type'
        const nameSpan = document.createElement('a')
        nameSpan.innerText = notifyVideo.dataName
        nameSpan.href = 'https://www.nicovideo.jp/series/' + notifyVideo.notifyData
        nameSpan.target = '_blank'//TODO リンク先を変えたい
        targetTypeDiv.appendChild(nameSpan)

        //操作
        const targetOperation = document.createElement('div')
        targetOperation.className = 'target-operation'
        //Next
        const nextButton = document.createElement('button')
        nextButton.innerText = 'Next'
        nextButton.addEventListener('click',()=>{
            NotificationDynamicChild.set(row.dataset.id,(child)=>{
                child.prevVideoId = row.dataset.videoId
                onNextVideo(child,document.getElementById(row.dataset.id).firstElementChild,row)
                return child
            })
        })
        //編集
        const deleteButton = document.createElement('button')
        deleteButton.innerText = '編集'
        deleteButton.dataset.id = notifyVideo.notifyId
        deleteButton.addEventListener('click',(e)=>{
            window.location.href = '/html/edit_notification.html?edit='+notifyVideo.notifyId
        })
        targetOperation.appendChild(nextButton)
        targetOperation.appendChild(deleteButton)


        const target = document.createElement('div')
        target.className = 'target'
        target.appendChild(targetTypeDiv)
        target.appendChild(targetOperation)
        row.appendChild(target)


        //更新内容
        const notificationRow = document.createElement('div')
        notificationRow.className = 'notification'
        notificationRow.id = notifyVideo.notifyId

        row.appendChild(notificationRow)

        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const tempBody = document.createElement('div')
                tempBody.className = 'hidden'
                notificationRow.appendChild(tempBody)
                new MutationObserver((mutationsList, observer) => {

                    for (const elm of tempBody.getElementsByClassName('NC-Link NC-MediaObject-contents')) {
                        elm.href = 'https://www.nicovideo.jp' + elm.href.match(/\/watch.*$/)[0]
                        elm.target = '_blank'
                        elm.addEventListener('click',(e)=>{
                            NotificationDynamicChild.set(row.dataset.id,(child)=>{
                                child.prevVideoId = row.dataset.videoId
                                onNextVideo(child,document.getElementById(row.dataset.id).firstElementChild,row)
                                return child
                            })
                        })
                    }
                    for (const elm of tempBody.getElementsByClassName('NC-Thumbnail-image')) {
                        elm.style.backgroundImage = `url("${elm.dataset.backgroundImage}")`
                    }
                    const seriesList = tempBody.getElementsByClassName('SeriesVideoListContainer')[0]

                    onNextVideo(notifyVideo,seriesList,row)
                    notificationRow.appendChild(seriesList)

                    tempBody.remove()
                    observer.disconnect()
                }).observe(tempBody, {
                    subtree: true,
                    childList: true
                })

                const respDOM = xhr.response
                tempBody.appendChild(respDOM.head)
                tempBody.appendChild(respDOM.body)
            }
        }
        xhr.onerror = () => {
            alert('記入のseriesはありませんでした')
        }
        xhr.open('GET', 'https://www.nicovideo.jp/series/' + notifyVideo.notifyData)
        xhr.responseType = 'document'
        xhr.send()

        return row
    }

    //Body作成
    const listBody = document.getElementById('body')
    let list = JSON.parse(PARAMETER.VIDEO.NOTIFICATION.LIST.pValue)
    list = list === null ? [] : list
    for (let notifyVideo of list) {
        //通知対象
        const row = createSeriesRow(notifyVideo)//TODO 条件
        listBody.appendChild(row)
    }

    //ボタン初期化
    document.getElementById('notification_edit').addEventListener('click', () => {
        window.location.href = '/html/edit_notification.html?add'
    })
})
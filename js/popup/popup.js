document.addEventListener('DOMContentLoaded', async () => {
    await BStorage.init()

    const onNextSeries = (child, seriesList, row)=>{
        for (const series of seriesList.children){
            series.style.display = "none"
        }
        let nextVideoId = null
        if (child.lastVideoId == null){
            seriesList.firstElementChild.style.display = ""
            const href = seriesList.firstElementChild.getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
            nextVideoId = href.substring(href.lastIndexOf("/")+1)
            row.getElementsByClassName('prev_button')[0].disabled = true
        } else {
            let lastIndex = 0
            for (const series of seriesList.children){
                const href = series.getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
                const videoID = href.substring(href.lastIndexOf("/")+1)
                if (videoID === child.lastVideoId){
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
                // row.getElementsByClassName('next_button')[0].disabled = false
            }else{
                row.getElementsByClassName('next_button')[0].disabled = true
            }
            row.getElementsByClassName('prev_button')[0].disabled = false
        }
        //新着既読
        if (child.isNotify){
            row.getElementsByClassName('target')[0].classList.remove('target-highlight')
            NotificationDynamicChild.set(child.notifyId,c=>{
                c.isNotify = false
                return c
            },false)
            //background通知
            const msg = {key: 'decrement', value: child.notifyId}
            browserInstance.runtime.sendMessage(msg)
        }
        row.dataset.videoId = nextVideoId
    }
    const onPrevSeries = (child, seriesList, row)=>{
        for (const series of seriesList.children){
            series.style.display = "none"
        }
        let prevVideoId = null
        if (child.lastVideoId == null){
            seriesList.firstElementChild.style.display = ""
        } else {
            let lastIndex = 0
            for (const series of seriesList.children){
                const href = series.getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
                const videoID = href.substring(href.lastIndexOf("/")+1)
                if (videoID === child.lastVideoId){
                    break
                }
                lastIndex++
            }
            const lastVideo = seriesList.children[lastIndex]
            if (lastVideo){
                lastVideo.style.display = ""
                if (lastIndex === 0){
                    prevVideoId = null
                    row.getElementsByClassName('prev_button')[0].disabled = true
                }else{
                    const href = seriesList.children[lastIndex-1].getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
                    prevVideoId = href.substring(href.lastIndexOf("/")+1)
                }
                row.getElementsByClassName('next_button')[0].disabled = false
            }

        }
        row.dataset.videoId = child.lastVideoId
        return prevVideoId
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
        nextButton.className = 'next_button'
        nextButton.addEventListener('click',()=>{
            NotificationDynamicChild.set(row.dataset.id,(child)=>{
                child.lastVideoId = row.dataset.videoId
                onNextSeries(child,document.getElementById(row.dataset.id).firstElementChild,row)
                return child
            })
        })
        //prev
        const prevButton = document.createElement('button')
        prevButton.innerText = 'Prev'
        prevButton.className = 'prev_button'
        prevButton.addEventListener('click',()=>{
            NotificationDynamicChild.set(row.dataset.id,(child)=>{
                child.lastVideoId = onPrevSeries(child,document.getElementById(row.dataset.id).firstElementChild,row)
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
        targetOperation.appendChild(prevButton)
        targetOperation.appendChild(deleteButton)


        const target = document.createElement('div')
        target.className = 'target'
        if (notifyVideo.isNotify){
            target.classList.add('target-highlight')
        }
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
                                child.lastVideoId = row.dataset.videoId
                                onNextSeries(child,document.getElementById(row.dataset.id).firstElementChild,row)
                                return child
                            })
                        })
                    }
                    for (const elm of tempBody.getElementsByClassName('NC-Thumbnail-image')) {
                        elm.style.backgroundImage = `url("${elm.dataset.backgroundImage}")`
                    }
                    const seriesList = tempBody.getElementsByClassName('SeriesVideoListContainer')[0]

                    onNextSeries(notifyVideo,seriesList,row)
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
    for (let notifyVideo of NotificationDynamicChild.getAll()) {
        //通知対象
        let row
        switch (notifyVideo.flag){
            case 'series':
                row = createSeriesRow(notifyVideo)
        }

        listBody.appendChild(row)
    }

    //ボタン初期化
    document.getElementById('notification_edit').addEventListener('click', () => {
        window.location.href = '/html/edit_notification.html?add'
    })
})
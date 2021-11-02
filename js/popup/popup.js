document.addEventListener('DOMContentLoaded', async () => {
    await BStorage.init()

    const onNextVideo = (child, seriesList, nextButton)=>{
        for (const series of seriesList.children){
            series.style.display = "none"
        }
        let nextVideoId = null
        if (child.lastVideoId == null){
            seriesList.firstElementChild.style.display = ""
            const href = seriesList.firstElementChild.getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
            nextVideoId = href.substring(href.lastIndexOf("/")+1)
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
            }
        }
        nextButton.dataset.videoId = nextVideoId
    }

    const listBody = document.getElementById('body')
    let list = JSON.parse(PARAMETER.VIDEO.NOTIFICATION.LIST.pValue)
    list = list === null ? [] : list
    for (let [i,v] of list.entries()) {
        v = new NotificationDynamicChild(v)
        //通知対象
        const row = document.createElement('div')
        // row.className = 'row'
        const tempID = UUID.generate()


        const targetTypeDiv = document.createElement('div')
        targetTypeDiv.className = 'target-type'
        const nameSpan = document.createElement('a')
        nameSpan.innerText = v.targetName
        nameSpan.href = 'https://www.nicovideo.jp/series/' + v.targetId
        nameSpan.target = '_blank'
        targetTypeDiv.appendChild(nameSpan)

        const targetIntervalDiv = document.createElement('div')
        targetIntervalDiv.className = 'target-interval'
        const intervalSpan = document.createElement('span')
        intervalSpan.innerText = v.targetIntervalWeek
        intervalSpan.innerText += '\n' + v.targetIntervalTime
        targetIntervalDiv.appendChild(intervalSpan)
        const targetLastedDiv = document.createElement('div')
        targetLastedDiv.className = 'target-lasted'
        targetLastedDiv.innerText = v.lastDatetime

        const targetOperation = document.createElement('div')
        targetOperation.className = 'target-operation'
        const nextButton = document.createElement('button')
        nextButton.innerText = '既読'
        nextButton.dataset.id = tempID
        nextButton.addEventListener('click',(e)=>{
            v.lastVideoId = e.target.dataset.videoId
            list[i] = v
            PARAMETER.VIDEO.NOTIFICATION.LIST.pValue = JSON.stringify(list)
            onNextVideo(v,document.getElementById(e.target.dataset.id).firstElementChild,e.target)
        })

        const deleteButton = document.createElement('button')
        deleteButton.innerText = '削除'
        deleteButton.dataset.id = tempID
        deleteButton.addEventListener('click',(e)=>{
            if (confirm('削除しますか？\n'+v.targetName)){
                list.splice(i,1)
                PARAMETER.VIDEO.NOTIFICATION.LIST.pValue = JSON.stringify(list)
                document.getElementById(e.target.dataset.id).parentElement.remove()
            }
        })
        targetOperation.appendChild(nextButton)
        targetOperation.appendChild(deleteButton)

        const target = document.createElement('div')
        target.className = 'target'
        target.appendChild(targetTypeDiv)
        target.appendChild(targetIntervalDiv)
        target.appendChild(targetLastedDiv)
        target.appendChild(targetOperation)
        row.appendChild(target)
        listBody.appendChild(row)

        //更新内容
        const notificationRow = document.createElement('div')
        notificationRow.className = 'notification'
        notificationRow.id = tempID

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
                        elm.addEventListener('click',()=>{
                            v.lastVideoId = nextButton.dataset.videoId
                            list[i] = v
                            PARAMETER.VIDEO.NOTIFICATION.LIST.pValue = JSON.stringify(list)
                            onNextVideo(v,document.getElementById(nextButton.dataset.id).firstElementChild,nextButton)
                        })
                    }
                    for (const elm of tempBody.getElementsByClassName('NC-Thumbnail-image')) {
                        elm.style.backgroundImage = `url("${elm.dataset.backgroundImage}")`
                    }
                    const seriesList = tempBody.getElementsByClassName('SeriesVideoListContainer')[0]

                    onNextVideo(v,seriesList,nextButton)
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
        xhr.open('GET', 'https://www.nicovideo.jp/series/' + v.targetId)
        xhr.responseType = 'document'
        xhr.send()
    }

    //ボタン初期化
    document.getElementById('notification_edit').addEventListener('click', () => {
        window.location.href = '/html/edit_notification.html'
    })
})
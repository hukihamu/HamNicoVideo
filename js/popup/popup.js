document.addEventListener('DOMContentLoaded', async () => {
    await BStorage.init()

    //Body作成
    const createBody = (childList, index) => {
        if (childList.length <= index) return
        const listBody = document.getElementById('body')
        let row
        const notifyVideo = childList[index]
        switch (notifyVideo.flag) {
            case 'series':
                row = createSeriesRow(childList, index)
                break
            case 'tag':
                row = createTagRow(childList, index)
                break
        }
        listBody.appendChild(row)
    }

    const onNextSeries = (child, seriesList, row, isInit) => {
        for (const series of seriesList.children) {
            series.style.display = 'none'
        }
        let nextVideoId = null
        if (child.lastVideoId == null) {
            seriesList.firstElementChild.style.display = ''
            const href = seriesList.firstElementChild.getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
            nextVideoId = href.substring(href.lastIndexOf('/') + 1)
            row.getElementsByClassName('target-index')[0].dataset.index = '01'
            row.getElementsByClassName('prev_button')[0].disabled = true
        } else {
            let lastIndex = 0
            for (const series of seriesList.children) {
                const href = series.getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
                const videoID = href.substring(href.lastIndexOf('/') + 1)
                if (videoID === child.lastVideoId) {
                    break
                }
                lastIndex++
            }
            lastIndex++ //次の動画参照のため1追加
            const nextVideo = seriesList.children[lastIndex]
            if (nextVideo) {
                nextVideo.style.display = ''
                const href = nextVideo.getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
                nextVideoId = href.substring(href.lastIndexOf('/') + 1)
                row.getElementsByClassName('target-index')[0].dataset.index = (lastIndex + 1).toString().padStart(2,'0')
            } else {
                row.getElementsByClassName('next_button')[0].disabled = true
                row.getElementsByClassName('target-index')[0].dataset.index = '00'
            }
            row.getElementsByClassName('prev_button')[0].disabled = false
        }
        //新着既読
        if (child.isNotify && !isInit) {
            row.getElementsByClassName('target')[0].classList.remove('target-highlight')
            child.isNotify = false
            //background通知
            const msg = {key: 'decrement', value: child}
            browserInstance.runtime.sendMessage(msg)
        }
        row.dataset.videoId = nextVideoId
        return child
    }
    const onPrevSeries = (child, seriesList, row) => {
        for (const series of seriesList.children) {
            series.style.display = 'none'
        }
        let prevVideoId = null
        if (child.lastVideoId == null) {
            seriesList.firstElementChild.style.display = ''
        } else {
            let lastIndex = 0
            for (const series of seriesList.children) {
                const href = series.getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
                const videoID = href.substring(href.lastIndexOf('/') + 1)
                if (videoID === child.lastVideoId) {
                    break
                }
                lastIndex++
            }
            const lastVideo = seriesList.children[lastIndex]
            if (lastVideo) {
                lastVideo.style.display = ''
                if (lastIndex === 0) {
                    prevVideoId = null
                    row.getElementsByClassName('prev_button')[0].disabled = true
                } else {
                    const href = seriesList.children[lastIndex - 1].getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
                    prevVideoId = href.substring(href.lastIndexOf('/') + 1)
                }
                row.getElementsByClassName('target-index')[0].dataset.index = (lastIndex + 1).toString().padStart(2,'0')
                row.getElementsByClassName('next_button')[0].disabled = false
            }

        }
        row.dataset.videoId = child.lastVideoId
        return prevVideoId
    }
    const emptyTagData = {
        contentId: '',
        title: '',
        description: '',
        viewCounter: '',
        mylistCounter: '',
        likeCounter: '',
        lengthSeconds: null,
        thumbnailUrl: '',
        startTime: null,
        lastResBody: '',
        commentCounter: ''
    }
    const setDataTagView = (row, data) => {
        if (data === emptyTagData) {
            row.getElementsByClassName('NC-MediaObject NC-VideoMediaObject SeriesVideoListContainer-video')[0].classList.add('hidden')
        } else {
            row.getElementsByClassName('NC-MediaObject NC-VideoMediaObject SeriesVideoListContainer-video')[0].classList.remove('hidden')


            row.getElementsByClassName('NC-Link NC-MediaObject-contents')[0]
                .href = 'https://www.nicovideo.jp/watch/' + data.contentId

            const thumbnailImage = row.getElementsByClassName('NC-Thumbnail-image')[0]
            thumbnailImage.setAttribute('aria-label', data.title)
            thumbnailImage.style = `background-image: url('${data.thumbnailUrl}.M');`//サムネ

            if (data.lengthSeconds) {
                const videoLengthSecond = data.lengthSeconds % 60
                const videoLengthMinute = Math.floor(data.lengthSeconds / 60)
                const videoLengthHour = Math.floor(videoLengthMinute / 60)
                const videoLengthText = videoLengthHour === 0 ? '' : videoLengthHour.toString().padStart(2, '0') + ':'
                row.getElementsByClassName('NC-VideoLength')[0].innerText = `${videoLengthText}${videoLengthMinute.toString().padStart(2, '0')}:${videoLengthSecond.toString().padStart(2, '0')}` //動画時間
            }

            row.getElementsByClassName('NC-MediaObjectTitle NC-VideoMediaObject-title NC-MediaObjectTitle_fixed2Line')[0].innerText = data.title// タイトル

            row.getElementsByClassName('NC-VideoMediaObject-description')[0].textContent = data.description//動画説明

            if (data.startTime) {
                //TODO NC-VideoRegisteredAtText-text_new
                const videoRegister = new Date(data.startTime)
                row.getElementsByClassName('NC-VideoRegisteredAtText-text')[0].innerText = `${videoRegister.getFullYear().toString().padStart(4, '0')}/${videoRegister.getMonth().toString().padStart(2, '0')}/${videoRegister.getDate().toString().padStart(2, '0')} ${videoRegister.getHours().toString().padStart(2, '0')}:${videoRegister.getMinutes().toString().padStart(2, '0')}` //投稿時間
            }

            row.getElementsByClassName('NC-VideoMetaCount NC-VideoMetaCount_view')[0].innerText = data.viewCounter//再生数

            row.getElementsByClassName('NC-VideoMetaCount NC-VideoMetaCount_comment')[0].innerText = data.commentCounter//コメント数

            row.getElementsByClassName('NC-VideoMetaCount NC-VideoMetaCount_like')[0].innerText = data.likeCounter//いいね吸う

            row.getElementsByClassName('NC-VideoMetaCount NC-VideoMetaCount_mylist')[0].innerText = data.mylistCounter//マイリス数
        }
    }
    const initTagView = (notificationRow) => {
        const d0 = document.createElement('div')
        d0.className = 'SeriesVideoListContainer'
        notificationRow.appendChild(d0)

        const d1 = document.createElement('div')
        d1.className = 'NC-MediaObject NC-VideoMediaObject SeriesVideoListContainer-video'
        d0.appendChild(d1)

        const d2 = document.createElement('div')
        d2.className = 'NC-MediaObject-main'
        d1.appendChild(d2)

        const a3 = document.createElement('a')
        a3.className = 'NC-Link NC-MediaObject-contents'
        a3.rel = 'noopener'
        a3.target = '_blank'
        a3.addEventListener('click', (e) => {
            NotificationDynamicChild.set(row.dataset.id, (child) => {
                child.lastVideoId = row.dataset.videoId
                child = onNextTag(child, row)
                return child
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
        d9_1.className = 'NC-Thumbnail-image'
        d9_1.role = 'img'
        d8_1.appendChild(d9_1)

        const d9_2 = document.createElement('div')
        d9_2.className = 'NC-VideoPlaybackIndicator'
        d8_1.appendChild(d9_2)
        const d10_1 = document.createElement('div')
        d10_1.className = 'NC-VideoPlaybackIndicator-inner'
        d10_1.style.transform = 'scaleX(0)'
        const d9_3 = document.createElement('div')
        d9_3.className = 'NC-VideoLength'
        d8_1.appendChild(d9_3)
        const d9_4 = document.createElement('div')
        d9_4.className = 'NC-VideoThumbnailComment'
        d8_1.appendChild(d9_4)
        //コメント
        // while (false){
        //     const s10 = document.createElement('span')
        //     s10.className = 'NC-VideoThumbnailComment-comment'
        //     s10.style.transitionDelay = ''//TODO
        //     const s11 = document.createElement('span')
        //     s11.className = 'NC-VideoThumbnailComment-inner'
        //     s11.style.transitionDelay = ''//TODO
        //     s11.innerText //TODO コメント
        // }


        const d4_2 = document.createElement('div')
        d4_2.className = 'NC-MediaObject-body'
        a3.appendChild(d4_2)

        const d5_2 = document.createElement('div')
        d5_2.className = 'NC-MediaObject-bodyTitle'
        d4_2.appendChild(d5_2)
        const h6_1 = document.createElement('h2')
        h6_1.className = 'NC-MediaObjectTitle NC-VideoMediaObject-title NC-MediaObjectTitle_fixed2Line'
        d5_2.appendChild(h6_1)


        const d5_3 = document.createElement('div')
        d5_3.className = 'NC-MediaObject-bodySecondary'
        d4_2.appendChild(d5_3)

        const d6_2 = document.createElement('div')
        d6_2.className = 'NC-VideoMediaObject-description'
        d5_3.appendChild(d6_2)

        const d6_3 = document.createElement('div')
        d6_3.className = 'NC-VideoMediaObject-meta'
        d5_3.appendChild(d6_3)

        const d7_2 = document.createElement('div')
        d7_2.className = 'NC-VideoMediaObject-metaAdditional'
        d6_3.appendChild(d7_2)

        const s8 = document.createElement('span')
        s8.className = 'NC-VideoRegisteredAtText'
        d7_2.appendChild(s8)
        const s9 = document.createElement('span')
        s9.className = 'NC-VideoRegisteredAtText-text'//TODO NC-VideoRegisteredAtText-text_new
        s8.appendChild(s9)
        const d8_2 = document.createElement('div')
        d8_2.className = 'NC-VideoLabels'
        d7_2.appendChild(d8_2)
        // const d9_5 = document.createElement('div')
        // d9_5.className = 'NC-VideoLabels-label NC-VideoLabels-channel'
        // d9_5.innerText = 'CH'//TODO チャンネルとか
        // d8_2.appendChild(d9_5)

        const d7_3 = document.createElement('div')
        d7_3.className = 'NC-VideoMediaObject-metaCount'
        d6_3.appendChild(d7_3)

        const d8_3 = document.createElement('div')
        d8_3.className = 'NC-VideoMetaCount NC-VideoMetaCount_view'
        d7_3.appendChild(d8_3)
        const d8_4 = document.createElement('div')
        d8_4.className = 'NC-VideoMetaCount NC-VideoMetaCount_comment'
        d7_3.appendChild(d8_4)
        const d8_5 = document.createElement('div')
        d8_5.className = 'NC-VideoMetaCount NC-VideoMetaCount_like'
        d7_3.appendChild(d8_5)
        const d8_6 = document.createElement('div')
        d8_6.className = 'NC-VideoMetaCount NC-VideoMetaCount_mylist'
        d7_3.appendChild(d8_6)
    }
    const onNextTag = (child, row, isInit) => {
        let dataList = JSON.parse(row.dataset.data)
        dataList = Array.isArray(dataList) ? dataList : []
        let index

        index = Number.parseInt(row.dataset.index)
        if (row.dataset.index < dataList.length) {
            child.lastVideoId = dataList[index].contentId
            row.getElementsByClassName('prev_button')[0].disabled = false
        } else {
            row.getElementsByClassName('prev_button')[0].disabled = true
        }

        const nextIndex = index - 1
        if (nextIndex < 0) {
            row.dataset.index = null
            setDataTagView(row, emptyTagData)
            row.getElementsByClassName('next_button')[0].disabled = true
            row.getElementsByClassName('target-index')[0].dataset.index = '00'
        } else {
            row.dataset.index = nextIndex
            setDataTagView(row, dataList[nextIndex])
            row.getElementsByClassName('target-index')[0].dataset.index = (dataList.length - nextIndex).toString().padStart(2,'0')
        }


        //新着既読
        if (child.isNotify && !isInit) {
            row.getElementsByClassName('target')[0].classList.remove('target-highlight')
            child.isNotify = false
            //background通知
            const msg = {key: 'decrement', value: child}
            browserInstance.runtime.sendMessage(msg)
        }
        return child
    }
    const onPrevTag = (child, row) => {
        let dataList = JSON.parse(row.dataset.data)
        dataList = Array.isArray(dataList) ? dataList : []

        let index = row.dataset.index === 'null' ? 0
            : Number.parseInt(row.dataset.index) + 1
        if (index < dataList.length) {
            setDataTagView(row, dataList[index])
            row.dataset.index = index
        }
        const prevIndex = index + 1
        let lastVideoId = null
        if (prevIndex < dataList.length) {
            lastVideoId = dataList[prevIndex].contentId
        } else {
            row.getElementsByClassName('prev_button')[0].disabled = true
        }
        row.getElementsByClassName('target-index')[0].dataset.index = (dataList.length - index).toString().padStart(2,'0')
        NotificationDynamicChild.set(child.notifyId, (c) => {
            c.lastVideoId = lastVideoId
            return c
        }, false)
        row.getElementsByClassName('next_button')[0].disabled = false
    }

    //シリーズ行
    const createSeriesRow = (childList, index) => {
        const notifyVideo = childList[index]
        const row = document.createElement('div')
        row.dataset.id = notifyVideo.notifyId

        //タイトル
        const targetTypeDiv = document.createElement('div')
        targetTypeDiv.className = 'target-type'
        const nameSpan = document.createElement('a')
        nameSpan.innerText = notifyVideo.dataName
        nameSpan.href = 'https://www.nicovideo.jp/series/' + notifyVideo.notifyData
        nameSpan.target = '_blank'
        targetTypeDiv.appendChild(nameSpan)

        //操作
        const targetOperation = document.createElement('div')
        targetOperation.className = 'target-operation'

        //Next
        const nextButton = document.createElement('button')
        nextButton.innerText = 'Next'
        nextButton.className = 'next_button'
        nextButton.addEventListener('click', () => {
            NotificationDynamicChild.set(row.dataset.id, (child) => {
                child.lastVideoId = row.dataset.videoId
                child = onNextSeries(child, document.getElementById(row.dataset.id).firstElementChild, row)
                return child
            })
        })
        const targetIndex = document.createElement('div')
        targetIndex.className = 'target-index'
        //prev
        const prevButton = document.createElement('button')
        prevButton.innerText = 'Prev'
        prevButton.className = 'prev_button'
        prevButton.addEventListener('click', () => {
            NotificationDynamicChild.set(row.dataset.id, (child) => {
                child.lastVideoId = onPrevSeries(child, document.getElementById(row.dataset.id).firstElementChild, row)
                return child
            })
        })

        //編集
        const editButton = document.createElement('button')
        editButton.innerText = '編集'
        editButton.className = 'edit_button'
        editButton.dataset.id = notifyVideo.notifyId
        editButton.addEventListener('click', (e) => {
            window.location.href = '/html/edit_notification.html?edit=' + notifyVideo.notifyId
        })
        targetOperation.appendChild(nextButton)
        targetOperation.appendChild(targetIndex)
        targetOperation.appendChild(prevButton)
        targetOperation.appendChild(editButton)


        const target = document.createElement('div')
        target.className = 'target'
        if (notifyVideo.isNotify) {
            target.classList.add('target-highlight')
        }
        target.appendChild(targetTypeDiv)
        target.appendChild(targetOperation)
        row.appendChild(target)


        const notificationRow = document.createElement('div')
        notificationRow.className = 'notification'
        notificationRow.id = notifyVideo.notifyId

        row.appendChild(notificationRow)

        //更新内容
        const createTarget = () => {
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
                            elm.addEventListener('click', (e) => {
                                NotificationDynamicChild.set(row.dataset.id, (child) => {
                                    child.lastVideoId = row.dataset.videoId
                                    child = onNextSeries(child, document.getElementById(row.dataset.id).firstElementChild, row)
                                    return child
                                })
                            })
                        }
                        for (const elm of tempBody.getElementsByClassName('NC-Thumbnail-image')) {
                            elm.style.backgroundImage = `url("${elm.dataset.backgroundImage}")`
                        }
                        const seriesList = tempBody.getElementsByClassName('SeriesVideoListContainer')[0]

                        NotificationDynamicChild.set(notifyVideo.notifyId,()=>onNextSeries(notifyVideo, seriesList, row, true))
                        notificationRow.appendChild(seriesList)

                        tempBody.remove()
                        observer.disconnect()
                        createBody(childList, index + 1)
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
        }
        const observe = new IntersectionObserver((entries)=>{
            for (const entry of entries){
                if (entry.isIntersecting){
                    createTarget()
                    observe.disconnect()
                }
            }
        }, {
            root: document.getElementById('body'),
            rootMargin: '50% 0px',
            threshold: 0.0
        })
        observe.observe(row)

        return row
    }
    //タグ行
    const createTagRow = (childList, index) => {
        const notifyVideo = childList[index]
        const row = document.createElement('div')
        row.dataset.id = notifyVideo.notifyId

        //タイトル
        const targetTypeDiv = document.createElement('div')
        targetTypeDiv.className = 'target-type'
        const nameSpan = document.createElement('a')
        nameSpan.innerText = notifyVideo.dataName
        nameSpan.href = 'https://www.nicovideo.jp/tag/' + notifyVideo.notifyData
        nameSpan.target = '_blank' /
            targetTypeDiv.appendChild(nameSpan)

        //操作
        const targetOperation = document.createElement('div')
        targetOperation.className = 'target-operation'

        //Next
        const nextButton = document.createElement('button')
        nextButton.innerText = 'Next'
        nextButton.className = 'next_button'
        nextButton.addEventListener('click', () => {
            NotificationDynamicChild.set(notifyVideo.notifyId,()=>onNextTag(notifyVideo, row))
        })
        const targetIndex = document.createElement('div')
        targetIndex.className = 'target-index'
        //prev
        const prevButton = document.createElement('button')
        prevButton.innerText = 'Prev'
        prevButton.className = 'prev_button'
        prevButton.addEventListener('click', () => {
            onPrevTag(notifyVideo, row)
        })

        //編集
        const deleteButton = document.createElement('button')
        deleteButton.innerText = '編集'
        deleteButton.className = 'edit_button'
        deleteButton.dataset.id = notifyVideo.notifyId
        deleteButton.addEventListener('click', (e) => {
            window.location.href = '/html/edit_notification.html?edit=' + notifyVideo.notifyId
        })
        targetOperation.appendChild(nextButton)
        targetOperation.appendChild(targetIndex)
        targetOperation.appendChild(prevButton)
        targetOperation.appendChild(deleteButton)


        const target = document.createElement('div')
        target.className = 'target'
        if (notifyVideo.isNotify) {
            target.classList.add('target-highlight')
        }
        target.appendChild(targetTypeDiv)
        target.appendChild(targetOperation)
        row.appendChild(target)


        const notificationRow = document.createElement('div')
        notificationRow.className = 'notification'
        notificationRow.id = notifyVideo.notifyId

        row.appendChild(notificationRow)

        //更新内容
        const createTarget = () => {
            const xhr = new XMLHttpRequest()//TODO タグ検索を利用
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {


                    let dataIndex = 0
                    if (notifyVideo.lastVideoId) {
                        for (const data of xhr.response.data) {
                            if (data.contentId === notifyVideo.lastVideoId) {
                                break
                            }
                            dataIndex++
                        }
                    } else {
                        dataIndex = xhr.response.data.length
                    }
                    row.dataset.data = JSON.stringify(xhr.response.data)
                    initTagView(notificationRow)
                    row.dataset.index = dataIndex
                    NotificationDynamicChild.set(notifyVideo.notifyId,()=>onNextTag(notifyVideo, row, true))
                    createBody(childList, index + 1)
                }
            }
            xhr.onerror = () => {
                alert('タグ検索に失敗しました')
            }
            const url = new URL('https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search')
            url.searchParams.set('q', notifyVideo.notifyData)
            url.searchParams.set('targets', 'tags')
            url.searchParams.set('fields', 'contentId,title,description,viewCounter,mylistCounter,likeCounter,lengthSeconds,thumbnailUrl,startTime,lastResBody,commentCounter')
            url.searchParams.set('_sort', '-startTime')
            url.searchParams.set('_limit', 50)
            url.searchParams.set('_context', 'HamNicoVideo')
            xhr.open('GET', url)
            xhr.responseType = 'json'

            xhr.send()
        }

        const observe = new IntersectionObserver(()=>{
            createTarget()
            observe.disconnect()
        }, {
            root: document.getElementById('body'),
            rootMargin: '50% 0px',
            threshold: 1.0
        })
        observe.observe(row)

        return row
    }

    createBody(NotificationDynamicChild.getAll(), 0)

    //ボタン初期化
    document.getElementById('notification_edit').addEventListener('click', () => {
        window.location.href = '/html/edit_notification.html?add'
    })
})
let badgeCounter = 0 //通知カウンター
browserInstance.runtime.onInstalled.addListener(async () => {
    await BStorage.init()

    const setBadge = ()=>{
        let details = {text: badgeCounter.toString()}
        if (badgeCounter === 0){
            details.text = ""
        }
        browserInstance.browserAction.setBadgeText(details)
    }

    const onCheckSeries = (child)=>{
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const tempBody = document.createElement('div')
                tempBody.className = 'hidden'
                document.body.appendChild(tempBody)
                new MutationObserver((mutationsList, observer) => {

                    const seriesList = tempBody.getElementsByClassName('SeriesVideoListContainer')[0]
                    if (seriesList.children.length > 0){
                        const series = seriesList.children[seriesList.children.length - 1]
                        const registeredElm = series.getElementsByClassName('NC-VideoRegisteredAtText-text')[0]
                        if (registeredElm.classList.contains('NC-VideoRegisteredAtText-text_new')){
                            //〇〇前 APIで取得
                            const href = series.getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
                            const videoID = href.substring(href.lastIndexOf("/")+1)
                            console.log(videoID)
                            const xhr = new XMLHttpRequest()
                            xhr.onreadystatechange = () => {
                                if (xhr.readyState === 4 && xhr.status === 200) {
                                    const parser = new window.DOMParser();
                                    let isNew = false
                                    const xmlData = parser.parseFromString( xhr.response , "text/xml");
                                    const first_retrieve = xmlData.getElementsByClassName('first_retrieve')[0]
                                    if (new Date(first_retrieve) >= new Date(child.lastChild)){
                                        badgeCounter++
                                        setBadge()
                                        isNew = true
                                    }
                                    NotificationDynamicChild.set(child.notifyId,child=>{
                                        child.lastChild = Date.now()
                                        child.isNotify = isNew
                                        return child
                                    },false)
                                }
                            }
                            xhr.onerror = () => {
                                alert('タグ検索に失敗しました')
                            }
                            const url = new URL('https://ext.nicovideo.jp/api/getthumbinfo/' + videoID)
                            xhr.open('GET', url)

                            xhr.send()


                        }else {
                            let isNew = false
                            if (new Date(child.lastCheck) < new Date(registeredElm.textContent)){
                                badgeCounter++
                                setBadge()
                                isNew = true
                            }
                            NotificationDynamicChild.set(child.notifyId,child=>{
                                child.lastChild = Date.now()
                                child.isNotify = isNew
                                return child
                            },false)
                        }
                    }


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
        xhr.open('GET', 'https://www.nicovideo.jp/series/' + child.notifyData)
        xhr.responseType = 'document'
        xhr.send()
    }
    const onCheckTag = (child)=>{
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const dataList = xhr.response.data
                let isNew = false
                if (child.lastVideoId){
                    if (dataList.length > 0){
                        const data = dataList[0]
                        if (new Date(data.startTime) >= new Date(child.lastChild)){
                            isNew = true
                        }
                    }
                }else if (dataList.length > 0){
                    //通知
                    isNew = true
                }

                if (isNew){
                    badgeCounter++
                    setBadge()
                }
                NotificationDynamicChild.set(child.notifyId,child=>{
                    child.lastChild = Date.now()
                    child.isNotify = isNew
                    return child
                },false)
            }
        }
        xhr.onerror = () => {
            alert('タグ検索に失敗しました')
        }
        const url = new URL('https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search')
        url.searchParams.set('q',child.notifyData)
        url.searchParams.set('targets','tags')
        url.searchParams.set('fields','contentId,startTime')
        url.searchParams.set('_sort','-startTime')
        url.searchParams.set('_limit',50)// TODO サイズ
        url.searchParams.set('_context','HamNicoVideo')
        xhr.open('GET', url)
        xhr.responseType = 'json'

        xhr.send()
    }
    const onCheck = (child) => {
        switch (child.flag) {
            case 'series':
                onCheckSeries(child)
                break
            case 'tag':
                onCheckTag(child)
                break
        }
    }

    const onCreateAlarm = (child) => {
        const dayOfWeekList = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

        const nowDay = new Date()
        const nowDayOfWeek = nowDay.getDate()
        const nowHour = `${nowDay.getHours().toString().padStart(2, '0')}:${nowDay.getMinutes().toString().padStart(2, '0')}`
        let dayOfWeek = nowDayOfWeek
        let counter
        for (counter = 0; counter < 7; counter++) {
            if (child.intervalWeek.indexOf(dayOfWeekList[dayOfWeek]) !== -1) {
                if (dayOfWeek === nowDayOfWeek) {
                    if (nowHour === child.intervalTime) {
                        //確認処理
                        return
                    } else if (nowHour < child.intervalTime) {
                        break
                    }
                } else {
                    break
                }
            }
            dayOfWeek++
            if (dayOfWeek >= 7) {
                dayOfWeek = 0
            }
        }
        const nextDay = new Date()
        nextDay.setDate(nowDayOfWeek + counter)
        nextDay.setHours(child.intervalTime.substring(0, 2), child.intervalTime.substring(3, 5),0,0)
        browserInstance.alarms.create(child.notifyId, {
            delayInMinutes: (nextDay.getTime() - Date.now()) / 60000
        })
    }

    browserInstance.alarms.onAlarm.addListener((alarm) => {
        const child = NotificationDynamicChild.get(alarm.name)
        //次のAlarm算出
        onCreateAlarm(child)
        //該当データの確認
        onCheck(child)
    })

    browserInstance.runtime.onMessage.addListener((msg) => {
        switch (msg.key) {
            case 'add':
                onCreateAlarm(NotificationDynamicChild.get(msg.value))
                break
            case 'edit':
                browserInstance.alarms.clear(msg.value)
                onCreateAlarm(NotificationDynamicChild.get(msg.value))
                break
            case 'remove':
                browserInstance.alarms.clear(msg.value)
                break
            case 'decrement':
                badgeCounter--
                setBadge()
                break
        }
    })


    for (const child of NotificationDynamicChild.getAll()){
        if (child.isInterval){
            //アラーム作成
            onCreateAlarm(child)
            //初期通知確認
            onCheck(child)
        }
    }
})


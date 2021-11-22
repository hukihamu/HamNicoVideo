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

    const onCheckSeries = (childList,index)=>{
        const child = index === undefined ?childList : childList[index]
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
                            const xhr = new XMLHttpRequest()
                            xhr.onreadystatechange = () => {
                                if (xhr.readyState === 4 && xhr.status === 200) {
                                    const parser = new window.DOMParser();
                                    const xmlData = parser.parseFromString( xhr.response , "text/xml");
                                    const first_retrieve = xmlData.getElementsByClassName('first_retrieve')[0]
                                    if (new Date(first_retrieve) >= new Date(child.lastCheck)){
                                        badgeCounter++
                                        setBadge()
                                        NotificationDynamicChild.set(child.notifyId,child=>{
                                            child.lastCheck = Date.now()
                                            child.isNotify = true
                                            return child
                                        })
                                    }
                                    if (index !== undefined){
                                        onCheck(childList,index + 1)
                                    }
                                }
                            }
                            xhr.onerror = () => {
                                alert('タグ検索に失敗しました')
                            }
                            const url = new URL('https://ext.nicovideo.jp/api/getthumbinfo/' + videoID)
                            xhr.open('GET', url)

                            xhr.send()


                        }else {
                            if (new Date(child.lastCheck) < new Date(registeredElm.textContent)){
                                badgeCounter++
                                setBadge()
                                NotificationDynamicChild.set(child.notifyId,child=>{
                                    child.lastCheck = Date.now()
                                    child.isNotify = true
                                    return child
                                })
                            }
                            if (index !== undefined){
                                onCheck(childList,index + 1)
                            }
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
    const onCheckTag = (childList,index)=>{//TODO タグ検索を
        const child = index === undefined ?childList : childList[index]
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const dataList = xhr.response.data
                let isNew = false
                if (child.lastVideoId){
                    if (dataList.length > 0){
                        const data = dataList[0]
                        if (new Date(data.startTime) >= new Date(child.lastCheck)){
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
                    NotificationDynamicChild.set(child.notifyId,child=>{
                        child.lastCheck = Date.now()
                        child.isNotify = isNew
                        return child
                    })
                }
                if (index !== undefined){
                    onCheck(childList,index + 1)
                }
            }
        }
        xhr.onerror = () => {
            alert('タグ検索に失敗しました')
        }
        const url = new URL('https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search')
        url.searchParams.set('q',child.notifyData)
        url.searchParams.set('targets','tags')
        url.searchParams.set('fields','contentId,startTime')
        // url.searchParams.set('filters[startTime][gte]',new Date(child.lastCheck).toISOString())
        url.searchParams.set('_sort','-startTime')
        url.searchParams.set('_limit',1)
        url.searchParams.set('_context','HamNicoVideo')
        xhr.open('GET', url)
        xhr.responseType = 'json'

        xhr.send()
    }
    const onCheck = (childList,index) => {
        if (index !== undefined && index >= childList.length) return
        const child = index === undefined ?childList : childList[index]
        switch (child.flag) {
            case 'series':
                onCheckSeries(childList,index)
                break
            case 'tag':
                onCheckTag(childList,index)
                break
        }
    }

    const onCreateAlarm = (child) => {
        const dayOfWeekList = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

        const nowDate = new Date()
        const nowDayOfWeek = nowDate.getDay()
        const nowHour = `${nowDate.getHours().toString().padStart(2, '0')}:${nowDate.getMinutes().toString().padStart(2, '0')}`
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
        nextDay.setDate(nextDay.getDate() + counter)
        nextDay.setHours(child.intervalTime.substring(0, 2), child.intervalTime.substring(3, 5),0,0)
        browserInstance.alarms.create(child.notifyId, {
            when: nextDay.getTime()
        })
    }

    browserInstance.alarms.onAlarm.addListener((alarm) => {
        browserInstance.storage.local.get(PARAMETER.VIDEO.NOTIFICATION.LIST.key,(items)=>{
            let childList = JSON.parse(items[PARAMETER.VIDEO.NOTIFICATION.LIST.key])
            childList = Array.isArray(childList) ? childList : []
            const child = childList.find(item=>{return item.notifyId === alarm.name})
            //次のAlarm算出
            onCreateAlarm(child)
            //該当データの確認
            onCheck(child)
        })
    })

    browserInstance.runtime.onMessage.addListener((msg) => {
        switch (msg.key) {
            case 'add':
                onCreateAlarm(msg.value)
                break
            case 'set':
                browserInstance.alarms.clear(msg.value.notifyId)
                onCreateAlarm(msg.value)
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

    const childList = NotificationDynamicChild.getAll()
    for (const child of childList){
        if (child.isInterval){
            //アラーム作成
            onCreateAlarm(child)
            //初期通知確認
        }
    }
    onCheck(childList,0)
})


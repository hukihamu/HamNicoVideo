let badgeCounter = 0 //通知カウンター
browserInstance.runtime.onInstalled.addListener(async () => {
    await BStorage.init()

    const onCheckSeries = (child)=>{
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const tempBody = document.createElement('div')
                tempBody.className = 'hidden'
                document.body.appendChild(tempBody)
                new MutationObserver((mutationsList, observer) => {//TODO APIのほうが良いと思う

                    const seriesList = tempBody.getElementsByClassName('SeriesVideoListContainer')[0]
                    let isNew = false
                    for (const series of seriesList.children){
                        const registeredElm = series.getElementsByClassName('NC-VideoRegisteredAtText-text')[0]
                        let register
                        if (registeredElm.classList.contains('NC-VideoRegisteredAtText-text_new')){
                            //〇〇前
                            register = new Date()
                            const hour = registeredElm.textContent.match(/\d+(?=時間前)/)
                            const minute = registeredElm.textContent.match(/\d+(?=分前)/)
                            if (hour){
                                register.setHours(register.getHours() - hour)
                            }else if (minute){
                                register.setHours(register.getHours(),register.getMinutes() - minute)
                            }else{
                                isNew = true
                                break
                            }

                        }else{
                            register = new Date(registeredElm.textContent)
                        }
                        if (child.lastCheck < register){
                            isNew = true
                            break
                        }
                    }
                    if (isNew){
                        badgeCounter++
                        browserInstance.browserAction.setBadgeText({text: badgeCounter.toString()})
                    }
                    NotificationDynamicChild.set(child.notifyId,child=>{
                        child.lastChild = Date.now()
                        child.isNotify = isNew
                        return child
                    },false)


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
    const onCheck = (child) => {
        switch (child.flag) {
            case 'series':
                onCheckSeries(child)
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
                browserInstance.browserAction.setBadgeText({text: badgeCounter.toString()})
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


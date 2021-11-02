browserInstance.runtime.onInstalled.addListener(async ()=>{
    await BStorage.init()

    const onNotification = ()=>{}

    const onCreateAlarm = (json)=>{
        let values = JSON.parse(json)
        browserInstance.alarms.clearAll(()=>{
            const dayOfWeekList = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
            for (const v of values){
                const nowDay = new Date()
                const nowDayOfWeek = nowDay.getDay()
                const nowHour = `${nowDay.getHours().toString().padStart(2,'0')}:${nowDay.getMinutes().toString().padStart(2,'0')}`
                let dayOfWeek = nowDayOfWeek
                let counter
                for (counter = 0;counter < 7; counter++){
                    if(v.targetIntervalWeek.indexOf(dayOfWeekList[dayOfWeek]) !== -1){
                        if (dayOfWeek === nowDayOfWeek){
                            if (nowHour === v.targetIntervalTime){
                                //確認処理
                                return
                            }else if (nowHour < v.targetIntervalTime){
                                break
                            }
                        }else{
                            break
                        }
                    }
                    dayOfWeek++
                    if (dayOfWeek >= 7){
                        dayOfWeek = 0
                    }
                }
                const nextDay = new Date()
                nextDay.setDate(nowDayOfWeek + counter)
                nextDay.setHours(v.targetIntervalTime.substring(0,1),v.targetIntervalTime.substring(3,4))
                browserInstance.alarms.create(v.targetName,{
                    delayInMinutes: (nextDay.getTime() - Date.now()) / 60000
                })
            }
        })
    }
    let badgeCounter = 0
    browserInstance.alarms.onAlarm.addListener((alarm)=>{

        //次のAlarm算出 TODO
        //該当データの確認
        badgeCounter++
        console.log(badgeCounter)
        browserInstance.browserAction.setBadgeText({text: badgeCounter.toString()})
    })

    browserInstance.runtime.onMessage.addListener((msg)=>{
        switch (msg.key){
            case "video/notification/list":
                onCreateAlarm(msg.value)
                break
        }
    })


    onCreateAlarm(PARAMETER.VIDEO.NOTIFICATION.LIST.pValue)
})


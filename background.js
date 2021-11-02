await BStorage.init()

chrome.alarms.onAlarm.addListener((alarm)=>{

})

let list = JSON.parse(PARAMETER.VIDEO.NOTIFICATION.LIST.pValue)
list = list === null ? [] : list
for (const v of list){

}
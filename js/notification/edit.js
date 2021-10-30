document.addEventListener('DOMContentLoaded',async ()=>{
    await BStorage.init()

    const editForm = document.getElementById('form')
    editForm.addEventListener('submit', (event) => {
        const weekList = []
        let isChecked = false
        const weekElms = document.getElementsByName('target_interval_week')
        for (const elm of weekElms) {
            if (elm.checked) {
                weekList.push(elm.value)
                isChecked = true
            }
        }
        const xhr = new XMLHttpRequest()

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let seriesName = xhr.response.match(/(?<=SeriesMenuContainer-seriesItemLink).+?(?=<\/a>)/)[0]
                seriesName = seriesName.match(/(?<=">).*/)[0]

                const child = new NotificationDynamicChild(
                    editForm.target_type.value,
                    editForm.series_id.value,
                    weekList,
                    editForm.target_interval_time.value,
                    seriesName
                )
                let childList = PARAMETER.VIDEO.notification.LIST.pValue
                childList = Array.isArray(childList) ? childList : []
                childList.push(child)
                console.log(JSON.stringify(childList))
                PARAMETER.VIDEO.notification.LIST.pValue = JSON.stringify(childList)
                window.location.href = '/html/popup.html'
            }
        }
        xhr.onerror = ()=>{
            alert('記入のseriesはありませんでした')
        }
        xhr.open('GET', 'https://www.nicovideo.jp/series/' + editForm.series_id.value)
        xhr.send()

        event.preventDefault();
        return false
    })

    function onClickWeek() {
        const temp = document.getElementsByName('target_interval_week')
        let isNotChecked = true
        for (const elm of temp) {
            elm.required = false
            if (elm.checked) {
                isNotChecked = false
            }
        }
        if (isNotChecked) {
            for (const elm of temp) {
                elm.required = true
            }
        }
    }

    const weekElms = document.getElementsByName('target_interval_week')
    for (const elm of weekElms) {
        elm.addEventListener('click', onClickWeek)
    }
    document.getElementById('notification').addEventListener('click',()=>{
        window.location.href = '/html/popup.html'
    })
})

document.addEventListener('DOMContentLoaded', async () => {
    await BStorage.init()


    const editForm = document.getElementById('form')

    //targetType切り替え
    for (const elm of document.getElementsByName('target_type')){
        elm.addEventListener('click',(e)=>{
            const seriesDiv = document.getElementById('series_value')
            const seriesInput = document.getElementsByName('series_id')[0]
            const tagDiv = document.getElementById('tags_value')
            const tagInput = document.getElementsByName('tags_name')[0]
            switch (e.target.value){
                case "series":
                    seriesDiv.className = ''
                    tagDiv.className = 'hidden'
                    seriesInput.required = true
                    tagInput.required = false
                    break
                case "tag":
                    tagDiv.className = ''
                    seriesDiv.className = 'hidden'
                    tagInput.required = true
                    seriesInput.required = false
                    break
            }
        })
    }

    //シリーズ登録
    const onSeries = (weekList) => {
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let seriesName = xhr.response.getElementsByClassName('SeriesDetailContainer-bodyTitle')[0]
                    .innerText

                const child = new NotificationDynamicChild({
                    targetType: editForm.target_type.value,
                    targetId: editForm.series_id.value,
                    targetIntervalWeek: weekList,
                    targetIntervalTime: editForm.target_interval_time.value,
                    targetName: seriesName
                })
                let childList = JSON.parse(PARAMETER.VIDEO.NOTIFICATION.LIST.pValue)
                childList = Array.isArray(childList) ? childList : []
                childList.push(child)
                PARAMETER.VIDEO.NOTIFICATION.LIST.pValue = JSON.stringify(childList)
                window.location.href = '/html/popup.html'
            }
        }
        xhr.onerror = () => {
            alert('記入のseriesはありませんでした')
        }
        xhr.open('GET', 'https://www.nicovideo.jp/series/' + editForm.series_id.value)
        xhr.responseType = 'document'
        xhr.send()
    }
    //タグ登録
    const onTags = (weekList)=>{
        const child = new NotificationDynamicChild({
                targetType: editForm.target_type.value,
                targetId: null,
                targetIntervalWeek: weekList,
                targetIntervalTime: editForm.target_interval_time.value,
                targetName: editForm.tags_name
            }
        )
        let childList = JSON.parse(PARAMETER.VIDEO.NOTIFICATION.LIST.pValue)
        childList = Array.isArray(childList) ? childList : []
        childList.push(child)
        PARAMETER.VIDEO.NOTIFICATION.LIST.pValue = JSON.stringify(childList)
        window.location.href = '/html/popup.html'
    }

    //サブミット
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

        switch (editForm.target_type.value){
            case "series":
                onSeries(weekList)
                break
            case "tag":
                onTags(weekList)
                break

        }

        event.preventDefault()
        return false
    })

    //チェックボックス必須家
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

    //戻る
    document.getElementById('notification').addEventListener('click', () => {
        window.location.href = '/html/popup.html'
    })
})

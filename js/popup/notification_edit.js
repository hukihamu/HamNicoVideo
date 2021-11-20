document.addEventListener('DOMContentLoaded', async () => {
    await BStorage.init()


    const editForm = document.getElementById('form')

    //登録か編集家判別
    const usp = new URLSearchParams(location.search)




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
    //interval切り替え
    document.getElementById('is_interval').addEventListener('change',(e)=>{
        const setInterval = document.getElementById('set_interval')
        if (e.target.checked){
            setInterval.className = ''
        }else{
            setInterval.className = 'hidden'
        }
        editForm.target_interval_time.required = e.target.checked
        onClickWeek()
    })


    //シリーズ登録
    const onSeries = (weekList) => {
        const intervalTime = document.getElementById('is_interval').checked
            ? editForm.target_interval_time.value
            : null

        if (usp.has('edit')){
            //変更
            NotificationDynamicChild.set(usp.get('edit'),child=>{
                child.isInterval = editForm.is_interval.checked
                child.intervalWeek = weekList
                child.intervalTime = intervalTime
                return child
            })
            window.location.href = '/html/popup.html'
        }else {
            //追加
            const xhr = new XMLHttpRequest()
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let seriesName = xhr.response.getElementsByClassName('SeriesDetailContainer-bodyTitle')[0]
                        .innerText
                    const child = new NotificationVideo(
                        UUID.generate(),
                        editForm.target_type.value,
                        editForm.series_id.value,
                        seriesName,
                        null,
                        editForm.is_interval.checked,
                        weekList,
                        intervalTime).getNotificationDynamicChild()
                    NotificationDynamicChild.add(child)
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
    }
    //タグ登録
    const onTags = (weekList)=>{
        const intervalTime = document.getElementById('is_interval').checked
                ? editForm.target_interval_time.value
                : null

        if (usp.has('edit')){
            //変更
            NotificationDynamicChild.set(usp.get('edit'),child=>{
                child.notifyData = editForm.tags_name.value
                child.dataName = editForm.tags_name.value
                child.isInterval = editForm.is_interval.checked
                child.intervalWeek = weekList
                child.intervalTime = intervalTime
                return child
            })
        }else{
            //追加
            const child = new NotificationVideo(
                UUID.generate(),
                editForm.target_type.value,
                editForm.tags_name.value,
                editForm.tags_name.value,
                null,
                editForm.is_interval.checked,
                weekList,
                intervalTime).getNotificationDynamicChild()
            NotificationDynamicChild.add(child)
        }
        window.location.href = '/html/popup.html'
    }

    //サブミット
    editForm.addEventListener('submit', (event) => {
        const weekList = []
        let isChecked = false
        if (document.getElementById('is_interval').checked){
            const weekElms = document.getElementsByName('target_interval_week')
            for (const elm of weekElms) {
                if (elm.checked) {
                    weekList.push(elm.value)
                    isChecked = true
                }
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
        let isNotChecked = document.getElementById('is_interval').checked
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

    //シリーズID取得
    document.getElementById('get_series_id').addEventListener('click',()=>{
        browserInstance.tabs.query({ active: true, currentWindow: true }, (e) => {
            const url = e[0].url;
            if (!url.match(/www.nicovideo.jp\/series/)) return
            editForm.series_id.value = url.match(/\d+/)[0]
        });
    })

    //戻る
    document.getElementById('notification').addEventListener('click', () => {
        window.location.href = '/html/popup.html'
    })

    //削除
    document.getElementById('delete').addEventListener('click', () => {
        if (confirm('削除しますか？')){
            window.location.href = '/html/popup.html'
            NotificationDynamicChild.remove(usp.get('edit'))
        }
    })

    if (usp.has('edit')){
        document.getElementById('add').className = 'hidden'

        const notifyVideo = NotificationDynamicChild.get(usp.get('edit'))
        const flagIndex = notifyVideo.flag === 'series' ? 0: 1
        const targetType = document.getElementsByName('target_type')
        targetType[flagIndex].checked = true
        for (const type of targetType){
            type.disabled = true
        }
        if (flagIndex === 0){
            editForm.series_id.value = notifyVideo.notifyData
            editForm.series_id.disabled = true
            document.getElementById('get_series_id').disabled = true
        }else{
            editForm.tags_name.value = notifyVideo.notifyData
        }
        console.log(notifyVideo.isInterval)
        if (!notifyVideo.isInterval){
            editForm.is_interval.click()
        }
        const weekIndex = []
        for (const week of notifyVideo.intervalWeek){
            switch (week){
                case 'mon':
                    weekIndex.push(0)
                    break
                case 'tue':
                    weekIndex.push(1)
                    break
                case 'wed':
                    weekIndex.push(2)
                    break
                case 'thu':
                    weekIndex.push(3)
                    break
                case 'fri':
                    weekIndex.push(4)
                    break
                case 'sat':
                    weekIndex.push(5)
                    break
                case 'sun':
                    weekIndex.push(6)
                    break
            }
        }
        const targetIntervalWeek = document.getElementsByName('target_interval_week')
        for (const i of weekIndex){
            targetIntervalWeek[i].click()
        }
        editForm.target_interval_time.value = notifyVideo.intervalTime
    }else{
        document.getElementById('edit').className = 'hidden'
    }
})

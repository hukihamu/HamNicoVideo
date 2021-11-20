document.addEventListener('DOMContentLoaded', async () => {
    await BStorage.init()


    const editForm = document.getElementById('form')

    //登録か編集家判別
    const usp = new URLSearchParams(location.search)


    if (usp.has('edit')){
        document.getElementById('add').className = 'hidden'
    }else{
        document.getElementById('edit').className = 'hidden'
    }

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
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let seriesName = xhr.response.getElementsByClassName('SeriesDetailContainer-bodyTitle')[0]
                    .innerText
                const intervalTime = document.getElementById('is_interval').checked
                    ? editForm.target_interval_time.value
                    : null
                const child = new NotificationVideo(
                    UUID.generate(),
                    editForm.target_type.value,
                    editForm.series_id.value,
                    seriesName,
                    null,
                    editForm.is_interval.value,
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
    //タグ登録
    const onTags = (weekList)=>{
        const intervalTime = document.getElementById('is_interval').checked
                ? editForm.target_interval_time.value
                : null
        const child = new NotificationVideo(
            UUID.generate(),
            editForm.target_type.value,
            editForm.tags_name.value,
            editForm.tags_name.value,
            null,
            editForm.is_interval.value,
            weekList,
            intervalTime).getNotificationDynamicChild()
        NotificationDynamicChild.add(child)
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
    document.getElementById('get_series-id').addEventListener('click',()=>{
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
})

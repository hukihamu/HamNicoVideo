import connection from '@/connection';
import {NicoAPI} from '@/nico_client/nico_api';

export const editNotify = ()=>{
    // 取得に利用した情報
    let videoId: string | null = null
    let seriesName: string | null = null

    const editForm = document.getElementById('form') as HTMLFormElement

    //登録か編集家判別
    const usp = new URLSearchParams(location.search)


    //targetType切り替え
    for (const elm of Array.from(document.getElementsByName('target_type'))){
        elm.addEventListener('click',(e)=>{
            const target = e.target as HTMLInputElement
            const seriesDiv = document.getElementById('series_value')
            const seriesInput = document.getElementsByName('series_id')[0] as HTMLInputElement
            const tagDiv = document.getElementById('tags_value')
            const tagInput = document.getElementsByName('tags_name')[0] as HTMLInputElement
            switch (target.value){
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
        const target = e.target as HTMLInputElement
        const setInterval = document.getElementById('set_interval')
        if (target.checked){
            setInterval.className = ''
        }else{
            setInterval.className = 'hidden'
        }
        editForm.target_interval_time.required = target.checked
        onClickWeek()
    })


    //シリーズ登録
    const onSubmitSeries = (weekList: number[]) => {
        const intervalTime: string | null = (document.getElementById('is_interval') as HTMLInputElement).checked
            ? editForm.target_interval_time.value
            : null

        if (usp.has('edit')){
            //変更
            // editChild.isInterval = editForm.is_interval.checked
            // editChild.intervalWeek = weekList
            // editChild.intervalTime = intervalTime
            // browserInstance.runtime.sendMessage({key: 'notify-set',value: editChild},()=>{
            //     window.location.href = '/html/popup.html'
            // })
        }else {
            //追加
            if (seriesName){
                // シリーズネームを取得できている
                const valuesSeries: ValuesNotifySeries = {
                    valueId: Date.now(),
                    seriesId: editForm.series_id.value,
                    seriesName: seriesName,
                    isNotify: false,
                    isInterval: editForm.is_interval.checked,
                    intervalTime: intervalTime,
                    intervalWeek: weekList,
                    lastVideoId: videoId
                }
                connection.connect('add', valuesSeries, ()=>{
                    window.location.href = '/html/popup_main.html'
                })
            }else {
                // シリーズネームを取得できていない
                fetch('https://www.nicovideo.jp/series/' + editForm.series_id.value)
                    .then(resp => resp.text())
                    .then(text => {
                        const doc = new DOMParser().parseFromString(text, 'text/html')
                        const seriesName = doc.getElementsByClassName('SeriesDetailContainer-bodyTitle')[0].textContent
                        const valuesSeries: ValuesNotifySeries = {
                            valueId: Date.now(),
                            seriesId: editForm.series_id.value,
                            seriesName: seriesName,
                            isNotify: false,
                            isInterval: editForm.is_interval.checked,
                            intervalTime: intervalTime,
                            intervalWeek: weekList,
                            lastVideoId: 'first'
                        }
                        connection.connect('add', valuesSeries, ()=>{
                            window.location.href = '/html/popup_main.html'
                        })
                    })
                    .catch(() => {
                        alert('記入のseriesはありませんでした\n「シリーズID取得」ボタンを利用ください')
                    })
            }
        }
    }
    //タグ登録 TODO
    // const onTags = (weekList)=>{
    //     const intervalTime = document.getElementById('is_interval').checked
    //         ? editForm.target_interval_time.value
    //         : null
    //
    //     if (usp.has('edit')){
    //         //変更
    //         editChild.notifyData = editForm.tags_name.value
    //         editChild.dataName = editForm.tags_name.value
    //         editChild.isInterval = editForm.is_interval.checked
    //         editChild.intervalWeek = weekList
    //         editChild.intervalTime = intervalTime
    //         browserInstance.runtime.sendMessage({key: 'notify-set',value: editChild},()=>{
    //             window.location.href = '/html/popup.html'
    //         })
    //     }else{
    //         //追加
    //         const child = new NotificationVideo(
    //             UUID.generate(),
    //             editForm.target_type.value,
    //             editForm.tags_name.value,
    //             editForm.tags_name.value,
    //             null,
    //             editForm.is_interval.checked,
    //             weekList,
    //             intervalTime).getNotificationDynamicChild()
    //         browserInstance.runtime.sendMessage({key: 'notify-add',value: child},()=>{
    //             window.location.href = '/html/popup.html'
    //         })
    //     }
    // }

    //シリーズID　入力条件
    document.getElementById('series_id').addEventListener('input',(e)=>{
        const target = e.target as HTMLInputElement
        target.value = target.value.replace(/[^0-9]/g, '')
    })

    //サブミット
    editForm.addEventListener('submit', (event) => {
        const weekList: number[] = []
        let isChecked = false
        const isInterval = document.getElementById('is_interval') as HTMLInputElement
        if (isInterval.checked){
            const weekElms = document.getElementsByName('target_interval_week') as NodeListOf<HTMLInputElement>
            for (const elm of Array.from(weekElms)) {
                const input = elm as HTMLInputElement
                if (elm.checked) {
                    weekList.push(Number.parseInt(elm.value))
                    isChecked = true
                }
            }
        }



        switch (editForm.target_type.value){
            case "series":
                onSubmitSeries(weekList)
                break
            // case "tag": TODO
            //     onTags(weekList)
            //     break

        }

        event.preventDefault()
        return false
    })

    //チェックボックス必須化
    function onClickWeek() {
        const temp = document.getElementsByName('target_interval_week') as NodeListOf<HTMLInputElement>
        const isInterval = document.getElementById('is_interval') as HTMLInputElement
        let isNotChecked = isInterval.checked
        for (const elm of Array.from(temp)) {
            elm.required = false
            if (elm.checked) {
                isNotChecked = false
            }
        }
        if (isNotChecked) {
            for (const elm of Array.from(temp)) {
                elm.required = true
            }
        }
    }
    // チェックボックスイベント追加
    const weekElms = document.getElementsByName('target_interval_week') as NodeListOf<HTMLInputElement>
    for (const elm of Array.from(weekElms)) {
        elm.addEventListener('click', onClickWeek)
    }

    //情報取得
    document.getElementById('get_video_info').addEventListener('click',async (event)=>{
        event.stopPropagation()
        let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
        if (!tab){
            alert('動画情報の取得に失敗しました')
            return
        }
        if (tab.url.match('https://www.nicovideo.jp/watch/')){
            let watchId = tab.url.replace('https://www.nicovideo.jp/watch/','')
            const questionIndex = watchId.indexOf('?')
            if (questionIndex !== -1){
                watchId = watchId.slice(0, questionIndex)
            }
            connection.connect('watch_detail', watchId, (resultValue)=>{
                if (resultValue){
                    const date = new Date(resultValue.data.video.registeredAt)
                    date.setMinutes(date.getMinutes() + 1)
                    editForm.target_interval_time.value = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2)
                    Array.from((document.getElementsByName('target_interval_week')) as NodeListOf<HTMLInputElement>).forEach(
                        (value, index)=>{
                            value.checked = index === date.getDay()
                        })
                    videoId = resultValue.data.client.watchId
                    onClickWeek()
                    console.log(resultValue)
                    switch (editForm.target_type.value) {
                        case 'series': {
                            if (resultValue.data.series){
                                seriesName = resultValue.data.series.title
                                editForm.series_id.value = resultValue.data.series.id
                            }else {
                                alert('シリーズを取得できませんでした')
                            }
                        }
                    }
                }else {
                    alert('動画情報の取得に失敗\n取得したい動画タブを選択してください')
                }
            })
        }else {
            alert('動画情報の取得に失敗\n取得したい動画タブを選択してください')
        }
    })

    //戻る
    document.getElementById('notification').addEventListener('click', (ev) => {
        ev.stopPropagation()
        window.location.href = '/html/popup_main.html'
    })

    //削除
    document.getElementById('delete').addEventListener('click', (ev) => {
        ev.stopPropagation()
        if (confirm('削除しますか？')){
            connection.connect('remove', usp.get('edit'), ()=>{
                window.location.href = '/html/popup_main.html'
            })
        }
    })

    if (usp.has('edit')){
        // 変更元取得
        document.getElementById('add').className = 'hidden'
        // TODO
        // chrome.runtime.sendMessage({key: 'get-child',value: usp.get('edit')},(child)=>{
        //     const flagIndex = child.flag === 'series' ? 0: 1
        //     const targetType = document.getElementsByName('target_type')
        //     targetType[flagIndex].click()
        //     for (const type of targetType){
        //         type.disabled = true
        //     }
        //     if (flagIndex === 0){
        //         editForm.series_id.value = child.notifyData
        //         editForm.series_id.disabled = true
        //         document.getElementById('get_series_id').disabled = true
        //     }else{
        //         editForm.tags_name.value = child.notifyData
        //     }
        //     if (!child.isInterval){
        //         editForm.is_interval.click()
        //     }
        //     const weekIndex = []
        //     for (const week of child.intervalWeek){
        //         switch (week){
        //             case 'mon':
        //                 weekIndex.push(0)
        //                 break
        //             case 'tue':
        //                 weekIndex.push(1)
        //                 break
        //             case 'wed':
        //                 weekIndex.push(2)
        //                 break
        //             case 'thu':
        //                 weekIndex.push(3)
        //                 break
        //             case 'fri':
        //                 weekIndex.push(4)
        //                 break
        //             case 'sat':
        //                 weekIndex.push(5)
        //                 break
        //             case 'sun':
        //                 weekIndex.push(6)
        //                 break
        //         }
        //     }
        //     const targetIntervalWeek = document.getElementsByName('target_interval_week')
        //     for (const i of weekIndex){
        //         targetIntervalWeek[i].click()
        //     }
        //     editForm.target_interval_time.value = child.intervalTime
        //     editChild = child
        // })
    }else{
        document.getElementById('edit').className = 'hidden'
    }
}

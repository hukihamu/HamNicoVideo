import connection from '@/connection';
import {BROWSER} from '@/browser';
import {doc} from '@/window';
import storage from '@/storage';
import util from '@/util';

export const editNotify = async ()=>{
    // 取得に利用した情報
    let videoId: string | undefined = undefined
    let seriesId: string | undefined = undefined
    let seriesName: string | undefined = undefined
    await storage.init()

    const editForm = document.getElementById('form') as HTMLFormElement

    //登録か編集家判別
    const editId = new URLSearchParams(location.search).get('edit')
    let editNotifyData: ValuesNotifySeries


    //targetType切り替え
    for (const elm of Array.from(document.getElementsByName('target_type'))) {
        elm.addEventListener('click',(e)=>{
            const target = e.target as HTMLInputElement
            const seriesDiv = document.getElementById('series_value') ?? util.throwText('series_value 取得に失敗')
            const tagDiv = document.getElementById('tags_value') ?? util.throwText('tags_value 取得に失敗')
            const tagInput = document.getElementsByName('tags_name')[0] as HTMLInputElement
            switch (target.value){
                case "series":
                    seriesDiv.className = ''
                    tagDiv.className = 'hidden'
                    tagInput.required = false
                    break
                case "tag":
                    tagDiv.className = ''
                    seriesDiv.className = 'hidden'
                    tagInput.required = true
                    break
            }
        })
    }
    //interval切り替え
    document.getElementById('is_interval')?.addEventListener('change',(e)=>{
        const target = e.target as HTMLInputElement
        const setInterval = document.getElementById('set_interval') ?? util.throwText('set_interval 取得に失敗')
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
        const intervalTime: string | undefined = (document.getElementById('is_interval') as HTMLInputElement).checked
            ? editForm.target_interval_time.value
            : null

        if (editId) {
            //変更
            editNotifyData.isInterval = editForm.is_interval.checked
            editNotifyData.intervalWeek = weekList
            editNotifyData.intervalTime = intervalTime
            connection.connect('edit', editNotifyData, ()=>{
                window.location.href = '/html/popup_main.html'
            })
        } else {
            //追加
            if (seriesId && seriesName){
                // シリーズネームを取得できている
                const valuesSeries: ValuesNotifySeries = {
                    valueId: Date.now(),
                    seriesId,
                    seriesName,
                    isNotify: false,
                    isInterval: editForm.is_interval.checked,
                    intervalTime,
                    intervalWeek: weekList,
                    lastVideoId: videoId,
                    lastCheckDateTime: Date.now()
                }
                connection.connect('add', valuesSeries, ()=>{
                    window.location.href = '/html/popup_main.html'
                })
            }else {
                // シリーズネームを取得できていない
                alert('動画視聴画面から情報を取得してください')
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
    document.getElementById('get_video_info')?.addEventListener('click',async (event)=>{
        event.stopPropagation()
        let [tab] = await BROWSER.tabs.query({ active: true, lastFocusedWindow: true })
        if (!tab){
            alert('動画情報の取得に失敗しました')
            return
        }
        if (tab.url?.match('https://www.nicovideo.jp/watch/')){
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
                    switch (editForm.target_type.value) {
                        case 'series': {
                            if (resultValue.data.series){
                                seriesId = resultValue.data.series.id.toString()
                                seriesName = resultValue.data.series.title
                                doc.getElementById('series_name').textContent = seriesName
                            }else {
                                alert('シリーズを取得できませんでした')
                                seriesId = undefined
                                seriesName = undefined
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
    document.getElementById('notification')?.addEventListener('click', (ev) => {
        ev.stopPropagation()
        window.location.href = '/html/popup_main.html'
    })

    //削除
    document.getElementById('delete')?.addEventListener('click', (ev) => {
        ev.stopPropagation()
        if (confirm('削除しますか？')){
            connection.connect('remove', Number.parseInt(editId ?? util.throwText('IDの取得に失敗しました')),()=>{
                window.location.href = '/html/popup_main.html'
            })
        }
    })
    // 編集・追加表示切替
    if (editId){
        // 編集不可項目
        doc.getElementById('add').className = 'hidden'
        doc.getElementById<HTMLButtonElement>('get_video_info').disabled = true

        // 変更元取得
        connection.connect('get_notify', Number.parseInt(editId), (notifyData)=>{
            // 通知対象型式切り替え

            if (util.isInstanceOf<ValuesNotifySeries>(notifyData, 'seriesId')){
                // シリーズ
                editForm.target_type[0].click()
                for (const type of editForm.target_type){
                    type.disabled = true
                }
                seriesId = notifyData.seriesId
                doc.getElementById('series_name').textContent = notifyData.seriesName
                if (!notifyData.isInterval){
                    editForm.is_interval.click()
                } else {
                    for (const weekIndex of notifyData.intervalWeek) {
                        const targetIntervalWeek = document.getElementsByName('target_interval_week')
                        targetIntervalWeek[weekIndex].click()
                    }
                    editForm.target_interval_time.value = notifyData.intervalTime
                }
                editNotifyData = notifyData
            }
        })
    }else{
        const edit = doc.getElementById('edit').className = 'hidden'
    }
}

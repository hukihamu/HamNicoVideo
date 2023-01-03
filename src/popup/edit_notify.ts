import connection from '@/connection';
import {BROWSER} from '@/browser';
import {doc} from '@/window';
import storage from '@/storage';
import util from '@/util';
import {Notify, NotifyType, NotifyTypeArray} from '@/notify/notify';
import {NotifyDetail, ValuesNotify} from '@/storage/parameters/values_type/values_notify';
import {WatchDetailType} from '@/nico_client/watch_detail';

export const editNotify = async () => {
    // 取得に利用した情報
    let notifyType: NotifyType = 'series'
    let notifyDetail: NotifyDetail | undefined = Notify.getInputNotify(notifyType).initNotifyDetail()
    let watchDetail: WatchDetailType | undefined
    await storage.init()
    const editForm = document.getElementById('form') as HTMLFormElement

    //登録か編集家判別
    const editId = new URLSearchParams(location.search).get('edit')
    let editNotifyData: ValuesNotify


    // targetType生成
    const targetType = doc.getElementById('target-type')
    for (const notifyTypeItem of NotifyTypeArray){
        const label = document.createElement('label')
        label.setAttribute('for',notifyTypeItem.key)
        label.textContent = notifyTypeItem.name
        const input = document.createElement('input')
        input.type = 'radio'
        input.name = 'target-type'
        input.id = notifyTypeItem.key
        input.value = notifyTypeItem.key
        input.addEventListener('change',()=>{
            doc.getElementById('target-value').replaceChildren(Notify.getInputNotify(notifyTypeItem.key).createNotifyDetailElement())
            notifyType = notifyTypeItem.key
            notifyDetail = Notify.getInputNotify(notifyType).initNotifyDetail()
        })

        targetType.appendChild(label)
        targetType.appendChild(input)

        if (notifyTypeItem.key === notifyType) input.click()
    }

    //interval切り替え
    document.getElementById('is_interval')?.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement
        const setInterval = document.getElementById('set_interval') ?? util.throwText('set_interval 取得に失敗')
        if (target.checked) {
            setInterval.className = ''
        } else {
            setInterval.className = 'hidden'
        }
        editForm.target_interval_time.required = target.checked
        onClickWeek()
    })

    //サブミット
    editForm.addEventListener('submit', (event) => {
        const weekList: number[] = []
        let isChecked = false
        const isInterval = document.getElementById('is_interval') as HTMLInputElement
        if (isInterval.checked) {
            const weekElms = document.getElementsByName('target_interval_week') as NodeListOf<HTMLInputElement>
            for (const elm of Array.from(weekElms)) {
                if (elm.checked) {
                    weekList.push(Number.parseInt(elm.value))
                    isChecked = true
                }
            }
        }

        // valuesの処理
        const intervalTime: string | undefined = (document.getElementById('is_interval') as HTMLInputElement).checked
            ? editForm.target_interval_time.value
            : null
        const ino = Notify.getInputNotify(notifyType)
        if (editId) {
            // 編集
            ino.setNotifyDetail(editNotifyData.config.notifyDetail)
            editNotifyData.config.isInterval = editForm.is_interval.checked
            editNotifyData.config.intervalWeek = weekList
            editNotifyData.config.intervalTime = intervalTime
            connection.connect('edit', editNotifyData).then( () => {
                window.location.href = '/html/popup_main.html'
            })
        } else {
            // 追加
            if (notifyDetail) {
                ino.setNotifyDetail(notifyDetail)
                const valuesNotify = {
                    config: {
                        valueId: Date.now(),
                        isInterval: editForm.is_interval.checked,
                        intervalTime,
                        intervalWeek: weekList,
                        lastWatchId: watchDetail?.data.client.watchId,
                        lastCheckDateTime: Date.now(),
                        notifyDetail
                    }
                } as ValuesNotify
                connection.connect('add', valuesNotify).then( () => {
                    window.location.href = '/html/popup_main.html'
                })
            } else {
                alert('追加に必要な情報が足りません')
            }
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
    document.getElementById('get_video_info')?.addEventListener('click', async (event) => {
        event.stopPropagation()
        let [tab] = await BROWSER.tabs.query({active: true, lastFocusedWindow: true})
        if (!tab) {
            alert('動画情報の取得に失敗しました')
            return
        }
        if (tab.url?.match('https://www.nicovideo.jp/watch/')) {
            let urlWatchId = tab.url.replace('https://www.nicovideo.jp/watch/', '')
            const questionIndex = urlWatchId.indexOf('?')
            if (questionIndex !== -1) {
                urlWatchId = urlWatchId.slice(0, questionIndex)
            }
            connection.connect('watch_detail', urlWatchId).then(async (resultValue) => {
                if (resultValue) {
                    watchDetail = resultValue
                    const date = new Date(watchDetail.data.video.registeredAt)
                    date.setMinutes(date.getMinutes() + 1)
                    editForm.target_interval_time.value = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2)
                    Array.from((document.getElementsByName('target_interval_week')) as NodeListOf<HTMLInputElement>).forEach(
                        (value, index) => {
                            value.checked = index === date.getDay()
                        })
                    onClickWeek()
                    const ino = Notify.getInputNotify(notifyType)
                    notifyDetail = ino.createNotifyDetail(watchDetail)
                    ino.showWatchDetail(watchDetail)
                } else {
                    alert('動画情報の取得に失敗\n取得したい動画タブを選択してください')
                }
            })
        } else {
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
        if (confirm('削除しますか？')) {
            connection.connect('remove', Number.parseInt(editId ?? util.throwText('IDの取得に失敗しました'))).then( () => {
                window.location.href = '/html/popup_main.html'
            })
        }
    })
    // 編集・追加表示切替
    if (editId) {
        // 編集不可項目
        doc.getElementById('add').className = 'hidden'
        doc.getElementById<HTMLButtonElement>('get_video_info').disabled = true

        // 変更元取得
        connection.connect('get_notify', Number.parseInt(editId)).then( (notifyData) => {
            // 通知対象型式切り替え
            notifyType = Notify.checkNotifyType(notifyData)
            doc.getElementById(notifyType).click()
            editNotifyData = notifyData
            Notify.getInputNotify(notifyType).showNotifyDetail(editNotifyData.config.notifyDetail)

            // 通知タイプ非有効
            for (const notifyTypeItem of NotifyTypeArray){
                (doc.getElementById(notifyTypeItem.key) as HTMLInputElement).disabled = true
            }

            if (!editNotifyData.config.isInterval) {
                editForm.is_interval.click()
            } else {
                for (const weekIndex of editNotifyData.config.intervalWeek) {
                    const targetIntervalWeek = document.getElementsByName('target_interval_week')
                    targetIntervalWeek[weekIndex].click()
                }
                editForm.target_interval_time.value = editNotifyData.config.intervalTime
            }
        })
    } else {
        doc.getElementById('edit').className = 'hidden'
    }
}

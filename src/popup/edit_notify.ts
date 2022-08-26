import connection from '@/connection';
import {BROWSER} from '@/browser';
import {doc} from '@/window';
import storage from '@/storage';
import util from '@/util';
import {Notify, ValuesNotifyType} from '@/notify/notify';

export const editNotify = async () => {
  // 取得に利用した情報
  let additionalValuesNotify: ValuesNotifySeriesType | ValueNotifyUserVideoType | undefined
  let watchId: string | undefined
  await storage.init()

  const editForm = document.getElementById('form') as HTMLFormElement

  //登録か編集家判別
  const editId = new URLSearchParams(location.search).get('edit')
  let editNotifyData: ValuesNotify


  //targetType切り替え
  for (const elm of Array.from(document.getElementsByName('target_type'))) {
    elm.addEventListener('click', (e) => {
      const target = e.target as HTMLInputElement
      Notify.EditNotify.onChangeTargetType(target.value as keyof ValuesNotifyType)
    })
  }
  Notify.EditNotify.onChangeTargetType('series')

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
    if (editId) {
      // 編集
      editNotifyData.isInterval = editForm.is_interval.checked
      editNotifyData.intervalWeek = weekList
      editNotifyData.intervalTime = intervalTime
      connection.oldConnect('edit', editNotifyData, () => {
        window.location.href = '/html/popup_main.html'
      })
    } else {
      // 追加
      const targetType = editForm.target_type.value as keyof ValuesNotifyType
      if (watchId && additionalValuesNotify && Notify.EditNotify.checkAdditionalValuesNotify(targetType, additionalValuesNotify)){
        const valuesNotify = ({
          valueId: Date.now(),
          isNotify: false,
          isInterval: editForm.is_interval.checked,
          intervalTime,
          intervalWeek: weekList,
          lastVideoId: watchId,
          lastCheckDateTime: Date.now()
        } && additionalValuesNotify) as unknown as ValuesNotify
        connection.oldConnect('add', valuesNotify, () => {
          window.location.href = '/html/popup_main.html'
        })

      }else {
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
      connection.connect('watch_detail', urlWatchId).then( async (resultValue) => {
        if (resultValue) {
          const date = new Date(resultValue.data.video.registeredAt)
          date.setMinutes(date.getMinutes() + 1)
          editForm.target_interval_time.value = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2)
          Array.from((document.getElementsByName('target_interval_week')) as NodeListOf<HTMLInputElement>).forEach(
            (value, index) => {
              value.checked = index === date.getDay()
            })
          onClickWeek()

          const targetType = editForm.target_type.value as keyof ValuesNotifyType
          additionalValuesNotify = await Notify.EditNotify.createAdditionalValuesNotify(targetType, resultValue)
          watchId = additionalValuesNotify ? resultValue.data.client.watchId : undefined
          Notify.EditNotify.initEditView(additionalValuesNotify)
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
      connection.oldConnect('remove', Number.parseInt(editId ?? util.throwText('IDの取得に失敗しました')), () => {
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
    connection.oldConnect('get_notify', Number.parseInt(editId), (notifyData) => {
      // 通知対象型式切り替え
      const targetTypeIndex = Notify.EditNotify.initEditView(notifyData as unknown as ValuesNotifyType[keyof ValuesNotifyType])
      if (targetTypeIndex) editForm.target_type[targetTypeIndex].click()

      for (const type of editForm.target_type) {
        type.disabled = true
      }
      if (!notifyData.isInterval) {
        editForm.is_interval.click()
      } else {
        for (const weekIndex of notifyData.intervalWeek) {
          const targetIntervalWeek = document.getElementsByName('target_interval_week')
          targetIntervalWeek[weekIndex].click()
        }
        editForm.target_interval_time.value = notifyData.intervalTime
      }
      editNotifyData = notifyData
    })
  } else {
    doc.getElementById('edit').className = 'hidden'
  }
}

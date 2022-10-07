import {OnSetCardGrid} from '@/video/type_on_set';
import {onSetControlCard} from '@/video/watch/control_card';
import {onSetChangeVideoList} from '@/video/watch/change_video_list';
import storage from '@/storage';
import {onSetRemoveWatchLater} from '@/video/watch/remove_watch_later';
import {onSetMinimizeLike} from '@/video/watch/minimize_like';
import {onSetOneClickMyList} from '@/video/watch/one_click_my_list';

export default ()=>{
    // enable確認
    const cardGridList: OnSetCardGrid[] = [] // カードに追加要素追加
    const initList: (()=>void)[] = [] // 初回起動時
    const videoChangeList: (()=>void)[] = [] // 動画変更毎
    if (storage.get("Video_Watch_ChangeVideoList").config.enable) cardGridList.push(onSetChangeVideoList)
    if (storage.get("Video_Watch_RemoveWatchLater").config.enable) videoChangeList.push(onSetRemoveWatchLater)
    if (storage.get("Video_Watch_MinimizeLike").config.enable) initList.push(onSetMinimizeLike)
    if (storage.get('Video_Watch_OneClickMyList').config.enable) {
        initList.push(onSetOneClickMyList.init)
        cardGridList.push(onSetOneClickMyList.cardGrid)
    }

    // 各画面要素の処理を呼び出し
    // 動画変更毎
    const onVideoChange = ()=>{
        const thumbnail = document.getElementsByClassName('VideoPlayer')[0]
        if (thumbnail){
            new MutationObserver((mutationsList)=>{
                for (const mutations of mutationsList){
                    const target = mutations.target as HTMLElement
                    if (target.className === 'VideoPlayer'){
                        videoChangeList.forEach(value => value())
                    }
                }
            }).observe(thumbnail, {
                attributes: true
            })
        }else {
            console.error('動画要素の取得に失敗')
        }
    }

    // 初回起動時
    const onInit = ()=>{
        if (cardGridList.length) {
            onSetControlCard.init()
            cardGridList.forEach(value => {
                value(onSetControlCard.createGrid(), onSetControlCard.createGridCell)
            })
        }
        initList.forEach(value => value())
        onVideoChange()
    }
    if (document.getElementsByClassName('VideoMenuContainer-areaLeft').length === 0) {
        new MutationObserver((mutationsList, observer) => {
            const areaLeft = document.getElementsByClassName('VideoMenuContainer-areaLeft')
            if (areaLeft.length > 0) {
                observer.disconnect()
                onInit()
            }
        }).observe(document.body, {
            subtree: true,
            childList: true
        })
    }else {
        onInit()
    }
}
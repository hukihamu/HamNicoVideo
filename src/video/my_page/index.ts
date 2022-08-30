import storage from '@/storage';
import {onSetAddWatchLater} from '@/video/my_page/add_watch_later';
import {OnSetRepoItem, OnSetRepoSidebar} from '@/video/type_on_set';
import {onSetSlimItem} from '@/video/my_page/slim_item';
import {onSetHighlightNewRange} from '@/video/my_page/highlight_new_range';
import {onSetHighlight} from '@/video/my_page/highlight';
import {onSetFilter} from '@/video/my_page/filter';
import {onSetHideSideBar} from '@/video/my_page/hide_side_bar';


export default () => {
    // enable確認
    const repoItemList: OnSetRepoItem[] = []
    const sideBarList: OnSetRepoSidebar[] = []
    if (storage.get('Video_MyPage_AddWatchLater').config.enable) repoItemList.push(onSetAddWatchLater)
    if (storage.get('Video_MyPage_SlimItem').config.enable) repoItemList.push(onSetSlimItem)
    if (storage.get('Video_MyPage_HighlightNewRange').config.enable) repoItemList.push(onSetHighlightNewRange)
    if (storage.get('Video_MyPage_Highlight').config.enable) repoItemList.push(onSetHighlight)
    if (storage.get('Video_MyPage_HiddenFilter').config.enable) {
        repoItemList.push(onSetFilter.item)
        sideBarList.push(onSetFilter.sideBar)
    }
    if (storage.get('Video_MyPage_HideSideBar').config.enable)sideBarList.push(onSetHideSideBar)
    // TODO 適時追加

    // 各画面要素の処理を呼び出し
    const userPageMain = document.getElementsByClassName('UserPage-main')[0]
    const userPageMainCallback: MutationCallback = mutationsList => {
        if (location.pathname.match('^(/my/|/my|/my/nicorepo|/my/nicorepo/)')){
            for (let mutation of mutationsList) {
                const target: HTMLElement = mutation.addedNodes[0] as HTMLElement
                if (target !== undefined && target.className !== undefined) {
                    // repo item
                    if (target.className === 'NicorepoTimeline' || target.className === 'NicorepoPage') {
                        for (const child of Array.from(target.getElementsByClassName('SlideOut NicorepoItem NicorepoTimeline-item'))) {
                            repoItemList.forEach(v => {
                                v(child as HTMLDivElement)
                            })
                        }
                    } else if (target.className.match('SlideOut NicorepoItem NicorepoTimeline-item')) {
                        repoItemList.forEach(v => {
                            v(target as HTMLDivElement)
                        })
                    }
                    if (!document.getElementById('nicorepo-filter')
                        && document.getElementsByClassName('SideContainer NicorepoSideContainer')[0]){
                        sideBarList.forEach(v =>v())
                    }
                }
            }
        }
    }
    new MutationObserver(userPageMainCallback).observe(userPageMain, {
        subtree: true,
        childList: true
    })
}
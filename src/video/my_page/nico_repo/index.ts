import storage from '@/storage';
import {onSetAddWatchLater} from '@/video/my_page/nico_repo/add_watch_later';
import {OnSetRepoItem, OnSetRepoSidebar} from '@/type_on_set/type_on_set';
import {onSetSlimItem} from '@/video/my_page/nico_repo/slim_item';
import {onSetHighlightNewRange} from '@/video/my_page/nico_repo/highlight_new_range';
import {onSetHighlight} from '@/video/my_page/nico_repo/highlight';
import {onSetFilter} from '@/video/my_page/nico_repo/filter';


export default () => {
    // enable確認
    const repoItemList: OnSetRepoItem[] = []
    const sideBarList: OnSetRepoSidebar[] = []
    if (storage.get('Video_MyPage_NicoRepo_AddWatchLater').enable) repoItemList.push(onSetAddWatchLater)
    if (storage.get('Video_MyPage_NicoRepo_SlimItem').enable) repoItemList.push(onSetSlimItem)
    if (storage.get('Video_MyPage_NicoRepo_HighlightNewRange').enable) repoItemList.push(onSetHighlightNewRange)
    if (storage.get('Video_MyPage_NicoRepo_Highlight').enable) repoItemList.push(onSetHighlight)
    if (storage.get('Video_MyPage_NicoRepo_HiddenFilter').enable) {
        repoItemList.push(onSetFilter.item)
        sideBarList.push(onSetFilter.sideBar)
    }
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
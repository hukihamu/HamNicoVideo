import storage from '@/storage';
import {onSetAddWatchLater} from '@/video/my_page/nico_repo/add_watch_later';
import {OnSetRepoItem} from '@/type_on_set/repo_item';
import {onSetSlimItem} from '@/video/my_page/nico_repo/slim_item';
import {onSetHighlightNewRange} from '@/video/my_page/nico_repo/highlight_new_range';


export default () => {
    // enable確認
    const repoItemList: OnSetRepoItem[] = []
    if (storage.get('Video_MyPage_NicoRepo_AddWatchLater').enable) repoItemList.push(onSetAddWatchLater)
    if (storage.get('Video_MyPage_NicoRepo_SlimItem').enable) repoItemList.push(onSetSlimItem)
    if (storage.get('Video_MyPage_NicoRepo_HighlightNewRange').enable) repoItemList.push(onSetHighlightNewRange)
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
                    // TODO repo side bar
                    // if (!document.getElementById('nicorepo-filter')
                    //     && document.getElementsByClassName('SideContainer NicorepoSideContainer')[0]){
                    //     setSideSetting()
                    // }
                }
            }
        }
    }
    new MutationObserver(userPageMainCallback).observe(userPageMain, {
        subtree: true,
        childList: true
    })
}
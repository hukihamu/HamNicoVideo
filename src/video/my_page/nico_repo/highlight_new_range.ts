import {OnSetRepoItem} from '@/type_on_set/repo_item';
import storage from '@/storage';

export const onSetHighlightNewRange: OnSetRepoItem = itemElement => {
    const createdAtItem = itemElement.getElementsByClassName('NicorepoItem-activityCreatedAt NicorepoItem-activityCreatedAt_new')[0] as HTMLElement
    const createdAtText = createdAtItem.textContent
    const setting = storage.get("Video_MyPage_NicoRepo_HighlightNewRange")
    let matchIndex = -1
    for (let i = 0; i < setting.selectList.length;i++) {
        if (createdAtText.match(setting.selectList[i].value)){
            matchIndex = i
            break
        }
    }
    if (matchIndex !== -1 && matchIndex <= setting.selectIndex){
        createdAtItem.style.color = '#d0021b'
    }else{
        createdAtItem.style.color = '#666'
    }
}
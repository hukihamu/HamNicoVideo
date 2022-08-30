import {OnSetRepoItem} from '@/video/type_on_set';
import storage from '@/storage';

export const onSetHighlightNewRange: OnSetRepoItem = itemElement => {
    const createdAtItem = itemElement.getElementsByClassName('NicorepoItem-activityCreatedAt NicorepoItem-activityCreatedAt_new')[0] as HTMLElement | undefined
    if (createdAtItem){
        const createdAtText = createdAtItem.textContent
        const setting = storage.get("Video_MyPage_HighlightNewRange")
        let matchIndex = -1
        for (let i = 0; i < setting.template.selectList.length;i++) {
            if (createdAtText?.match(setting.template.selectList[i].value)){
                matchIndex = i
                break
            }
        }
        if (matchIndex !== -1 && matchIndex <= setting.config.selectIndex){
            createdAtItem.style.color = '#d0021b'
        }else{
            createdAtItem.style.color = '#666'
        }
    }
}
import {OnSetNicoRepo, OnSetRepoItem} from '@/video/type_on_set'
import storage from '@/storage';

export const onSetHighlight: OnSetRepoItem = itemElement => {
    const activityDescriptionText = itemElement.getElementsByClassName('NicorepoItem-activityDescription')[0].textContent
    let resultColor: string | undefined = undefined
    for (const v of Object.values(storage.get('Video_MyPage_Highlight').values)) {
        if (activityDescriptionText.match(v.matcher)) {
            resultColor = v.color
            break
        }
    }
    if (resultColor) {
        (itemElement.firstChild as HTMLElement).style.backgroundColor = resultColor
    }
}
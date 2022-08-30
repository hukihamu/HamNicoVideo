import {OnSetRepoItem} from '@/video/type_on_set'
import storage from '@/storage';
import util from '@/util';

export const onSetHighlight: OnSetRepoItem = itemElement => {
    const activityDescriptionText = itemElement.getElementsByClassName('NicorepoItem-activityDescription')[0].textContent
    let resultColor: string | undefined = undefined
    util.forParamValues(storage.get('Video_MyPage_Highlight'), (value)=>{
        if (value.config.enable && activityDescriptionText?.match(value.template.matcher)) {
            resultColor = value.config.color
            return true
        }
        return
    })
    if (resultColor) {
        (itemElement.firstChild as HTMLElement).style.backgroundColor = resultColor
    }
}
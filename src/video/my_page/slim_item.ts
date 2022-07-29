import {OnSetRepoItem} from '@/video/type_on_set';

export const onSetSlimItem: OnSetRepoItem = itemElement => {
    (itemElement.firstChild as HTMLDivElement).style.padding = '5px'
    itemElement.style.marginTop = '8px'
}
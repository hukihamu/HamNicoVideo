import {OnSetRepoItem} from '@/type_on_set/repo_item';

export const onSetSlimItem: OnSetRepoItem = itemElement => {
    (itemElement.firstChild as HTMLDivElement).style.padding = '5px'
    itemElement.style.marginTop = '8px'
}
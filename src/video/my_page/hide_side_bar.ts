import {OnSetRepoSidebar} from '@/video/type_on_set';
import storage from '@/storage';
import {throwText} from '@/util';

export const onSetHideSideBar: OnSetRepoSidebar = ()=>{
    const params = storage.get("Video_MyPage_HideSideBar")
    const subMenuClasses: {[key: string]: boolean} = {
        'RadioGroup NicorepoPageSubMenu-types': params.values[0].enable,
        'RadioGroup NicorepoPageSubMenu-target': params.values[1].enable,
        'NicorepoPageSubMenu-filter': params.values[2].enable,
    }

    for (const _header of Array.from(document.getElementsByClassName('SubMenuHeader'))) {
        const header = _header as HTMLDivElement
        header.style.border = "1px"
        const ul = header.parentElement?.getElementsByClassName('SubMenuLinkList')[0] as HTMLElement | undefined
            ?? throwText('SubMenuLinkList が見つかりませんでした')
        ul.style.transition = '0.5s'
        ul.style.overflow = 'hidden'
        ul.style.height = 'auto'
        ul.dataset['height'] = ul.clientHeight.toString()
        ul.style.height = (!subMenuClasses[ul.parentElement?.className ?? ''] ? ul.dataset['height'] : '0') + 'px'
        header.addEventListener('click', () => {
            const lastH = ul.style.height
            ul.style.height = (lastH === '0px') ? ul.dataset['height'] + 'px' : '0px'
        })
        header.addEventListener('mouseover', () => {
            header.style.backgroundColor = '#ccc8'
        })
        header.addEventListener('mouseout', () => {
            header.style.backgroundColor = '#0000'
        })
    }
}
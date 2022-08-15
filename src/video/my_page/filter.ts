import {OnSetNicoRepo} from '@/video/type_on_set';
import storage from '@/storage';
import {ValuesNicoRepoMatcher} from '@/storage/parameters/values_type/values_nico_repo_matcher';
import {ParameterStaticValues} from '@/storage/parameters/parameter_value/parameter_static_values';

export const onSetFilter: OnSetNicoRepo =  {
    item: itemElement => {
        const activityDescriptionText = itemElement.getElementsByClassName('NicorepoItem-activityDescription')[0].textContent
        let result: boolean|undefined = undefined
        for (const v of storage.get('Video_MyPage_HiddenFilter').values) {
            if (activityDescriptionText?.match(v.matcher)) {
                result = v.enable
                break
            }
        }

        itemElement.style.display = result ? 'none' : 'block'
    },
    sideBar: () => {
        const subMenu = document.getElementsByClassName('NicorepoPageSubMenu')[0]
        const div = document.createElement('div')
        div.style.marginTop = '24px'
        div.className = 'NicorepoPageSubMenu-filter'
        subMenu.appendChild(div)

        const header = document.createElement('header')
        header.className = 'SubMenuHeader'
        header.id = 'nicorepo-filter'
        const headerTitle = document.createElement('h3')
        headerTitle.className = 'SubMenuHeader-title'
        headerTitle.innerText = '非表示フィルター'
        header.appendChild(headerTitle)
        div.appendChild(header)


        const ul = document.createElement('ul')
        ul.className = 'SubMenuLinkList'
        div.appendChild(ul)
        //各フィルターセット
        const param = storage.get("Video_MyPage_HiddenFilter")
        for (const value of param.values){
            const element = createCheckBox(value, param)
            ul.appendChild(element)
        }
    }
}
function createCheckBox(value: ValuesNicoRepoMatcher, param: ParameterStaticValues<ValuesNicoRepoMatcher>) {
    const subMenuItem = document.createElement('li')
    subMenuItem.className = 'SubMenuLink NicorepoPageSubMenu-subMenuItem'
    const subMenuItemLink = document.createElement('a')
    subMenuItemLink.className = 'SubMenuLink-link SubMenuLink-link_internal'

    const checkBox = document.createElement('input')
    checkBox.type = 'checkbox'
    checkBox.className = 'SubMenuLink-icon'
    subMenuItemLink.addEventListener('click',  (event) =>{
        checkBox.checked = !checkBox.checked
        value.enable = checkBox.checked
        storage.set("Video_MyPage_HiddenFilter", param)
        for (const child of Array.from(document.getElementsByClassName('SlideOut NicorepoItem NicorepoTimeline-item'))) {
            onSetFilter.item(child as HTMLDivElement)
        }

    }, false)
    checkBox.checked = value.enable

    const label = document.createElement('span')
    label.className = 'SubMenuLink-label'
    label.textContent = value.name
    subMenuItemLink.appendChild(checkBox)
    subMenuItemLink.appendChild(label)
    subMenuItem.appendChild(subMenuItemLink)
    return subMenuItem
}
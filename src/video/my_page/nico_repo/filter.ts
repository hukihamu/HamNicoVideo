import {OnSetNicoRepo} from '@/type_on_set/type_on_set';
import storage from '@/storage';
import {NicoRepoMatcherType} from '@/storage/parameters/nico_repo_matcher';

export const onSetFilter: OnSetNicoRepo =  {
    item: itemElement => {
        const activityDescriptionText = itemElement.getElementsByClassName('NicorepoItem-activityDescription')[0].textContent
        let result: boolean|undefined = undefined
        for (const v of storage.get('Video_MyPage_NicoRepo_HiddenFilter').values) {
            if (activityDescriptionText.match(v.matcher)) {
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
        const filters = storage.get("Video_MyPage_NicoRepo_HiddenFilter").values
        for (let i = 0; i < filters.length; i++) {
            const element = createCheckBox(filters[i].name,filters[i].enable)
            ul.appendChild(element)
        }
    }
}
function createCheckBox(name: string, enable: boolean) {
    const subMenuItem = document.createElement('li')
    subMenuItem.className = 'SubMenuLink NicorepoPageSubMenu-subMenuItem'
    const subMenuItemLink = document.createElement('a')
    subMenuItemLink.className = 'SubMenuLink-link SubMenuLink-link_internal'

    const checkBox = document.createElement('input')
    checkBox.type = 'checkbox'
    checkBox.className = 'SubMenuLink-icon'
    subMenuItemLink.addEventListener('click',  (event) =>{
        checkBox.checked = !checkBox.checked
        const filters = storage.get("Video_MyPage_NicoRepo_HiddenFilter")
        const index = filters.values.findIndex(v =>v.name === name)
        filters.values[index].enable = checkBox.checked
        storage.set("Video_MyPage_NicoRepo_HiddenFilter", filters)
        for (const child of Array.from(document.getElementsByClassName('SlideOut NicorepoItem NicorepoTimeline-item'))) {
            onSetFilter.item(child as HTMLDivElement)
        }

    }, false)
    checkBox.checked = enable

    const label = document.createElement('span')
    label.className = 'SubMenuLink-label'
    label.innerText = name
    subMenuItemLink.appendChild(checkBox)
    subMenuItemLink.appendChild(label)
    subMenuItem.appendChild(subMenuItemLink)
    return subMenuItem
}
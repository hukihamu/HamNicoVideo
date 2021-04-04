function setSideSetting() {
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
        headerTitle.innerText = 'フィルター'
        header.appendChild(headerTitle)
        div.appendChild(header)


        const ul = document.createElement('ul')
        ul.className = 'SubMenuLinkList'
        div.appendChild(ul)
        //各フィルターセット
        const filters = Object.values(PARAMETER.VIDEO.REPO.FILTER)
        for (let i = 1; i < filters.length; i++) {
            const element = createCheckBox(filters[i])
            ul.appendChild(element)
        }
        setAccordionToUl()
}

function createCheckBox(filter) {
    const subMenuItem = document.createElement('li')
    subMenuItem.className = 'SubMenuLink NicorepoPageSubMenu-subMenuItem'
    const subMenuItemLink = document.createElement('a')
    subMenuItemLink.className = 'SubMenuLink-link SubMenuLink-link_internal'

    const checkBox = document.createElement('input')
    checkBox.type = 'checkbox'
    checkBox.className = 'SubMenuLink-icon'
    subMenuItemLink.addEventListener('click', function (event) {
        if (event.target.nodeName !== 'INPUT') {
            checkBox.checked = !checkBox.checked
        }
        filter.pValue = checkBox.checked
        for (const child of document.getElementsByClassName('SlideOut NicorepoItem NicorepoTimeline-item')) {
            applyFilter(child)
        }

    }, false)
    checkBox.checked = filter.pValue

    const label = document.createElement('span')
    label.className = 'SubMenuLink-label'
    label.innerText = PARAMETER_TEXT[filter.key]
    subMenuItemLink.appendChild(checkBox)
    subMenuItemLink.appendChild(label)
    subMenuItem.appendChild(subMenuItemLink)
    return subMenuItem
}

function applyFilter(item) {
    const activityDescription = item.getElementsByClassName('NicorepoItem-activityDescription')[0]
    const result = MatcherPValue.elementMatchText(activityDescription.innerText, PARAMETER.VIDEO.REPO.FILTER)
    if (result !== null) {
        item.style.display = result.pValue ? 'none' : 'block'
    }
}
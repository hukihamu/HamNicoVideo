function setAccordionToUl() {
    const subMenuClasses = {
        'RadioGroup NicorepoPageSubMenu-types': PARAMETER.VIDEO.REPO.SIDE_FOLD.TYPES,
        'RadioGroup NicorepoPageSubMenu-target': PARAMETER.VIDEO.REPO.SIDE_FOLD.TARGET,
        'NicorepoPageSubMenu-filter': PARAMETER.VIDEO.REPO.SIDE_FOLD.FILTER,
    }

    for (let header of document.getElementsByClassName('SubMenuHeader')) {
        header.style.border = 1
        const ul = header.parentNode.getElementsByClassName('SubMenuLinkList')[0]
        ul.style.transition = '0.5s'
        ul.style.overflow = 'hidden'
        ul.style.height = 'auto'
        ul.dataset['height'] = ul.clientHeight

        ul.style.height = (subMenuClasses[ul.parentNode.className].pValue ? ul.dataset['height'] : '0') + 'px'
        header.onclick = () => {
            const lastH = ul.style.height
            ul.style.height = (lastH === '0px') ? ul.dataset['height'] + 'px' : '0px'
        }
        header.onmouseover = () => {
            header.style.backgroundColor = '#ccc8'
        }
        header.onmouseout = () => {
            header.style.backgroundColor = '#0000'
        }
    }
}
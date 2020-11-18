const nicorepo = async function () {
    await BrowserStorage.init()


    //document 定数
    const NICOREPO = {
        getItemArray: () => {
            const array = []
            const nodes = document.getElementsByClassName('NicorepoTimeline')[0].getElementsByClassName('NicorepoItem-item')
            for (let i = 0; i < nodes.length; i++) {
                array.push(new NicorepoItem(nodes[i]))
            }
            return array
        }
    }

    class NicorepoItem {
        constructor(_item) {
            this.item = _item
            this.style = this.item.style
            this.activityDescription = this.item.getElementsByClassName('NicorepoItem-activityDescription')[0]
            this.senderName = this.item.getElementsByClassName('NicorepoItem-senderName')[0]
            this.contentDetailTitle = this.item.getElementsByClassName('NicorepoItem-contentDetailTitle')[0]

            this.parentStyle = this.item.parentNode.style
        }
    }

//サイドメニュー作成
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
        const filters = Object.values(OPTION_PARAM.NICOREPO.FILTER.VALUE_FILTER)
        for (let filter of filters) {
            const element = filter.createCheckBox(applyFilter)
            ul.appendChild(element)
        }

    }

//色をつける
    function applyNicorepoColor() {

        const itemArray = NICOREPO.getItemArray()
        //配列内の'NicorepoItem-activityDescription'を取得
        for (let i = 0; i < itemArray.length; i++) {
            //Matcherで判別、色付け
            const item = itemArray[i]
            item.style.padding = '5px'
            const activityDescription = item.activityDescription.innerText
            const highlight = elementMatchText(activityDescription, OPTION_PARAM.NICOREPO.HIGHLIGHT.VALUE_HIGHLIGHT)
            if (highlight !== null) {
                item.style.backgroundColor = BrowserStorage.get(highlight.key)
            }
        }
    }

//GMをもとにFilterをかける
    function applyFilter() {
        const itemArray = NICOREPO.getItemArray()
        for (let i = 0; i < itemArray.length; i++) {
            const item = itemArray[i]
            const itemText = item.activityDescription.innerText
            const filter = elementMatchText(itemText, OPTION_PARAM.NICOREPO.FILTER.VALUE_FILTER)
            if (filter !== null) {
                item.parentStyle.display = BrowserStorage.get(filter.key) ? 'none' : 'block'
            }
        }
    }
    function setAccordionToUl() {
        const subMenuClasses = {
            'RadioGroup NicorepoPageSubMenu-types': BrowserStorage.get(OPTION_PARAM.NICOREPO.SHOW.SHOW_TYPES.key),
            'RadioGroup NicorepoPageSubMenu-target': BrowserStorage.get(OPTION_PARAM.NICOREPO.SHOW.SHOW_TARGET.key),
            'NicorepoPageSubMenu-filter': BrowserStorage.get(OPTION_PARAM.NICOREPO.SHOW.SHOW_FILTER.key)
        }

        for (let header of document.getElementsByClassName('SubMenuHeader')){
            header.style.border = 1
            const ul = header.parentNode.getElementsByClassName('SubMenuLinkList')[0]
            ul.style.transition = '0.5s'
            ul.style.overflow = 'hidden'
            ul.style.height = 'auto'
            ul.dataset['height'] = ul.clientHeight

            ul.style.height = (subMenuClasses[ul.parentNode.className] ? ul.dataset['height']: '0') + 'px'
            header.onclick = ()=>{
                const lastH = ul.style.height
                ul.style.height = ( lastH === '0px') ? ul.dataset['height']+'px' : '0px';
            }
            header.onmouseover = ()=>{
                header.style.backgroundColor = '#ccc8'
            }
            header.onmouseout = ()=>{
                header.style.backgroundColor = '#0000'
            }
        }


    }

    function elementMatchText(text, object) {
        const filters = Object.values(object)
        for (let i = 0; i < filters.length; i++) {
            const element = filters[i]
            if (text.match(element.match) !== null) {
                return element
            }
        }
        return null
    }

    //ニコレポの各アクションにイベントを付与
    function setNicorepo(observer) {
        //左部サイドメニュー
        const subMenuLinkList = document.getElementsByClassName('NicorepoPageSubMenu-subMenuItem')
        for (let i = 0; i < subMenuLinkList.length; i++) {
            // subMenuLinkList[i].addEventListener('click', findNicorepo, false)
        }
        //もっと見る
        const more = document.getElementsByClassName('NicorepoTimeline-more')[0]
        //もっと見るが見つかったのなら他もあるだろう
        if (more !== undefined) {
            // more.addEventListener('click', findNicorepo, false)

            if (BrowserStorage.get(OPTION_PARAM.NICOREPO.FILTER.IS_FILTER.key)) {
                //サイドメニュー追加
                if (document.getElementById('nicorepo-filter') === null) {
                    setSideSetting()
                }

                setAccordionToUl()

                //フィルター
                applyFilter()
            }

            //色
            if (BrowserStorage.get(OPTION_PARAM.NICOREPO.HIGHLIGHT.IS_HIGHLIGHT.key)) {
                applyNicorepoColor()
            }
        }
    }

    let nicorepoObserver

    function findNicorepo() {

        //表示されるまで待機＆探す
        const targetNode = document.getElementById('UserPage-app')
        const config = {childList: true, subtree: true}
        const callback = function (mutationsList, observer) {
            setNicorepo(observer)
        }
        const timeline = targetNode.getElementsByClassName('NicorepoTimeline')[0]
        if (timeline !== undefined) {
            setNicorepo()
        }
        nicorepoObserver = new MutationObserver(callback)
        nicorepoObserver.observe(targetNode, config)
    }


//上部タブメニュー
    const mainMenuItemArray = document.getElementsByClassName('MainMenuItem')
    for (let i = 0; i < mainMenuItemArray.length; i++) {
        const item = mainMenuItemArray[i]
        if (item.innerText === 'ニコレポ') {
            const callback = function (mutationsList, observer) {
                if (mutationsList[0].oldValue === 'MainMenuItem') {
                    if (nicorepoObserver !== undefined) nicorepoObserver.disconnect()
                    findNicorepo()
                }
            }
            new MutationObserver(callback).observe(item, {
                attributes: true,
                attributeFilter: ['class'],
                attributeOldValue: true
            })

        }
    }
    findNicorepo()
}
window.onload = nicorepo



const nicorepo = async function(){
    const settings = ChromeStorage.init()
    await Promise.all([settings])
    //document 定数
    const NICOREPO = {
        getTimeline: ()=>{return document.getElementsByClassName('NicorepoTimeline')[0]},
        getItemArray: ()=>{
            const array = []
            const nodes = document.getElementsByClassName('NicorepoTimeline')[0].getElementsByClassName('NicorepoItem-item')
            for(let i = 0;i < nodes.length;i++){
                array.push(new NicorepoItem(nodes[i]))
            }
            return array
        }
    }
    class NicorepoItem{
        constructor(_item){
            this.item = _item
            this.style = this.item.style
            this.activityDescription = this.item.getElementsByClassName('NicorepoItem-activityDescription')[0]
            this.senderName = this.item.getElementsByClassName('NicorepoItem-senderName')[0]
            this.contentDetailTitle = this.item.getElementsByClassName('NicorepoItem-contentDetailTitle')[0]

            this.parentStyle = this.item.parentNode.style
        }
    }

//サイドメニュー作成
    function setSideSetting(){
        const subMenu = document.getElementsByClassName('NicorepoPageSubMenu')[0]



        const header = document.createElement("header")
        header.className = "SubMenuHeader"
        header.id = "nicorepo-filter"
        const headerTitle = document.createElement("h3")
        headerTitle.className = "SubMenuHeader-title"
        headerTitle.innerHTML = "フィルター"
        header.appendChild(headerTitle)

        subMenu.appendChild(header)
        //各フィルターセット
        const filters = Object.values(OPTION_PARAM.NICOREPO.FILTER.VALUE_FILTER)
        for (let filter of filters){
            const element = filter.createCheckBox(applyFilter)
            subMenu.appendChild(element)
        }

    }

//色をつける
    function applyNicorepoColor(){

        const itemArray = NICOREPO.getItemArray()
        //配列内の'NicorepoItem-activityDescription'を取得
        for (let i = 0; i < itemArray.length; i++){
            //Matcherで判別、色付け
            const item = itemArray[i]
            item.style.padding = '5px'
            const activityDescription = item.activityDescription.innerText
            const highlight = elementMatchText(activityDescription,OPTION_PARAM.NICOREPO.HIGHLIGHT.VALUE_HIGHLIGHT)
            if (highlight !== null){
                item.style.backgroundColor = ChromeStorage.get(highlight.key)
            }
        }
    }
//GMをもとにFilterをかける
    function applyFilter(){
        const itemArray = NICOREPO.getItemArray()
        for(let i = 0; i < itemArray.length; i++){
            const item = itemArray[i]
            const itemText = item.activityDescription.innerText
            const filter = elementMatchText(itemText,OPTION_PARAM.NICOREPO.FILTER.VALUE_FILTER)
            if (filter !== null) {
                item.parentStyle.display = ChromeStorage.get(filter.key) ? 'none' : 'block'
            }
        }
    }

    function elementMatchText(text, object){
        const filters = Object.values(object)
        for (let i = 0; i < filters.length;i++) {
            const element = filters[i]
            if (text.match(element.match) !== null){
                return element
            }
        }
        return null
    }

    //ニコレポの各アクションにイベントを付与
    function setNicorepo(observer){
            //左部サイドメニュー
            const subMenuLinkList = document.getElementsByClassName('NicorepoPageSubMenu-subMenuItem')
            for (let i = 0; i < subMenuLinkList.length; i++) {
                subMenuLinkList[i].addEventListener('click', findNicorepo, false)
            }
            //もっと見る
            const more = document.getElementsByClassName('NicorepoTimeline-more')[0]
            //もっと見るが見つかったのなら他もあるだろう
            if (more !== undefined){
                more.addEventListener('click', findNicorepo, false)

                if (ChromeStorage.get(OPTION_PARAM.NICOREPO.FILTER.IS_FILTER.key)) {
                    //サイドメニュー追加
                    if (document.getElementById('nicorepo-filter') === null) {
                        setSideSetting()
                    }
                    //フィルター
                    applyFilter()
                }

                //色
                if (ChromeStorage.get(OPTION_PARAM.NICOREPO.HIGHLIGHT.IS_HIGHLIGHT.key)){
                    applyNicorepoColor()
                }

                if (observer !== undefined) observer.disconnect()
            }
    }
    function findNicorepo() {
        //表示されるまで待機＆探す
        const targetNode = document.getElementsByClassName('TimelineContainer')[0]
        const config = { childList: true, subtree : true};
        const callback = function(mutationsList, observer) {
            setNicorepo(observer)
        }
        if (targetNode !== undefined){
            if (document.getElementsByClassName('NicorepoTimeline-more')[0]  !== undefined){
                setNicorepo()
            }else {
                const observer = new MutationObserver(callback);
                observer.observe(targetNode, config);
            }
        }
    }

//上部タブメニュー
    const mainMenuItemArray = document.getElementsByClassName('MainMenuItem');
    for(let i = 0;i < mainMenuItemArray.length;i++){
        const item = mainMenuItemArray[i]
        if (item.innerText === "ニコレポ"){
            const callback = function(mutationsList){
                if(mutationsList[0].oldValue === 'MainMenuItem'){
                    findNicorepo()
                }
            }
            new MutationObserver(callback).observe(item,{attributes: true,attributeFilter:['class'],attributeOldValue: true});

        }
    }
    findNicorepo()
}
window.onload = nicorepo


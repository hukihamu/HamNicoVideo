

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

    //各フィルターセット
    const likeItem = NicorepoElement.LIKE.createCheckBox(applyFilter)
    const adItem = NicorepoElement.AD.createCheckBox(applyFilter)
    const liveItem = NicorepoElement.LIVE.createCheckBox(applyFilter)
    const kiribanItem = NicorepoElement.KIRIBAN.createCheckBox(applyFilter)

    subMenu.appendChild(header)
    subMenu.appendChild(likeItem)
    subMenu.appendChild(adItem)
    subMenu.appendChild(liveItem)
    subMenu.appendChild(kiribanItem)

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
        const ne = elementMatchText(activityDescription)
        if (ne !== null){
            item.style.backgroundColor = ne.colorValue
        }
    }
}
//GMをもとにFilterをかける
function applyFilter(){
    const itemArray = NICOREPO.getItemArray()
    for(let i = 0; i < itemArray.length; i++){
        const item = itemArray[i]
        const itemText = item.activityDescription.innerText
        const ne = elementMatchText(itemText)
        if (ne !== null) {
            item.parentStyle.display = ne.filterValue ? 'none' : 'block'
        }
    }
}

//ニコレポの各アクションにイベントを付与
function setNicorepoEvent(){
    //表示されるまで待機＆探す
    const targetNode = document.getElementsByClassName('TimelineContainer')[0]
    const config = { childList: true, subtree : true};
    const callback = function(mutationsList, observer) {

        //左部サイドメニュー
        const subMenuLinkList = document.getElementsByClassName('NicorepoPageSubMenu-subMenuItem')
        for (let i = 0; i < subMenuLinkList.length; i++) {
            subMenuLinkList[i].addEventListener('click', setNicorepoEvent, false)
        }
        //もっと見る
        const more = document.getElementsByClassName('NicorepoTimeline-more')[0]
        //もっと見るが見つかったのなら他もあるだろう
        if (more !== undefined){
            more.addEventListener('click', setNicorepoEvent, false)

            //サイドメニュー追加
            if (document.getElementById('nicorepo-filter') === null) {
                setSideSetting()
            }
            //フィルター
            applyFilter()
            //色
            applyNicorepoColor()

            observer.disconnect()
        }


    };
    if (targetNode !== undefined){
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }


}
//上部タブメニュー
const mainMenuItemArray = document.getElementsByClassName('MainMenuItem');
for(let i = 0;i < mainMenuItemArray.length;i++){
    const item = mainMenuItemArray[i]
    if (item.innerText === "ニコレポ"){
        const callback = function(mutationsList){
            if(mutationsList[0].oldValue === 'MainMenuItem'){
                setNicorepoEvent()
            }
        }
        new MutationObserver(callback).observe(item,{attributes: true,attributeFilter:['class'],attributeOldValue: true});
    }
}
setNicorepoEvent()
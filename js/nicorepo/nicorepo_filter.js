


class NFilter {
    constructor(_key,_text,_match,_color) {
        this.key = _key
        this.text = _text
        this.matchText = _match
        this.colorValue = _color//default fff
        this.filterValue = getLocal(this.key + "_filter",Boolean)
    }

    createCheckBox(_applyFilter){
        const subMenuItem = document.createElement("li")
        subMenuItem.className = "SubMenuLink NicorepoPageSubMenu-subMenuItem"
        const subMenuItemLink = document.createElement("a")
        subMenuItemLink.className = "SubMenuLink-link SubMenuLink-link_internal"

        const checkBox = document.createElement("input")
        checkBox.type = "checkbox"
        checkBox.className = "SubMenuLink-icon"
        const nFilter = this
        subMenuItemLink.addEventListener('click',function(event){
            if(event.target.nodeName!=='INPUT'){
                checkBox.checked = !checkBox.checked
            }
            setLocal(nFilter.key+ "_filter",checkBox.checked)
            nFilter.filterValue = checkBox.checked
            _applyFilter()
        },false)

        checkBox.checked = this.filterValue

        const label = document.createElement("span")
        label.className = "SubMenuLink-label"
        label.innerHTML = this.text
        subMenuItemLink.appendChild(checkBox)
        subMenuItemLink.appendChild(label)
        subMenuItem.appendChild(subMenuItemLink)
        return subMenuItem
    }
}
const NicorepoElement = {
    LIKE: new NFilter('like','いいね！','^動画を「いいね！」しました$','#a5d17814'),
    AD: new NFilter('ad', '広告','^ニコニ広告しました'),
    LIVE: new NFilter('live', '生放送','生放送を開始しました$'),
    KIRIBAN: new NFilter('kiriban', 'キリ番','再生を達成しました$'),
    MYLIST: new NFilter('mylist','マイリスト','^マイリスト','#76b3f914'),
    ADD_VIDEO: new NFilter('add_video','動画投稿','投稿しました$|^動画を登録しました$','#d0021b14'),
}
function elementMatchText(text){
    const nicorepoElements = Object.values(NicorepoElement)
    for (let i = 0; i < nicorepoElements.length;i++) {
        const element = nicorepoElements[i]
        if (text.match(element.matchText) !== null){
            return element
        }
    }
    return null
}
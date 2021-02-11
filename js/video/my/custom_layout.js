function customLayout(item) {
    applyLayout(item)

    if (PARAMETER.VIDEO.REPO.CUSTOM_LAYOUT.HIGHLIGHT.ENABLE.pValue)
        applyHighlight(item)
}

function applyLayout(item) {
    item.firstChild.style.padding = '5px'
    item.style.marginTop = '8px'
}
function applyHighlight(item){
    const activityDescription = item.getElementsByClassName('NicorepoItem-activityDescription')[0]
    const result = MatcherPValue.elementMatchText(activityDescription.innerText, PARAMETER.VIDEO.REPO.CUSTOM_LAYOUT.HIGHLIGHT)
    if (result !== null) {
        item.firstChild.style.backgroundColor = result.pValue
    }
}
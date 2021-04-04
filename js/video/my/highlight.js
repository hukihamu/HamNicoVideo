function applyHighlight(item){
    const activityDescription = item.getElementsByClassName('NicorepoItem-activityDescription')[0]
    const result = MatcherPValue.elementMatchText(activityDescription.innerText, PARAMETER.VIDEO.REPO.HIGHLIGHT)
    if (result !== null) {
        item.firstChild.style.backgroundColor = result.pValue
    }
}
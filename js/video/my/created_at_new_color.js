function createdAtNewColor(item){
    const createdAtItem = item.getElementsByClassName('NicorepoItem-activityCreatedAt NicorepoItem-activityCreatedAt_new')[0]
    const createdAtText = createdAtItem.innerText
    const setting = PARAMETER.VIDEO.REPO.CREATED_AT_NEW_COLOR.pValue
    let matchIndex = -1
    for (let i = 0; i < CREATED_AT_VALUES.length;i++) {
        if (createdAtText.match(CREATED_AT_VALUES[i].value)){
            matchIndex = i
            break
        }
    }
    if (matchIndex !== -1 && matchIndex <= setting){
        createdAtItem.style.color = '#d0021b'
    }else{
        createdAtItem.style.color = '#666'
    }
}
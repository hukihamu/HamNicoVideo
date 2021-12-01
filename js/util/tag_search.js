//TODO タグ検索共通化

// 'https://ext.nicovideo.jp/api/getthumbinfo/' + videoID
//他全部

// '○?='
//ID、有料、P限定

function getTagList(tag,callback){
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const doc = xhr.response
            const scripts = doc.getElementsByTagName('script')
            let json
            for (const script of scripts){
                if (script.type === 'application/ld+json'){
                    json = script.innerText
                    break
                }
            }
            //premium-only
            //contentBody video uad videoList videoList01
        }
    }
    const url = new URL('https://www.nicovideo.jp/tag/' + tag)
    url.searchParams.set('sort','f')
    xhr.open('GET', url)
    xhr.responseType = 'document'
    xhr.send()
}
const onCheckTag = (childList,index)=>{//TODO タグ検索を
    const child = index === undefined ?childList : childList[index]
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const dataList = xhr.response.data
            let isNew = false
            if (child.lastVideoId){
                if (dataList.length > 0){
                    const data = dataList[0]
                    if (new Date(data.startTime) >= new Date(child.lastCheck)){
                        isNew = true
                    }
                }
            }else if (dataList.length > 0){
                //通知
                isNew = true
            }

            if (isNew){
                badgeCounter++
                setBadge()
                NotificationDynamicChild.set(child.notifyId,child=>{
                    child.lastCheck = Date.now()
                    child.isNotify = isNew
                    return child
                })
            }
            if (index !== undefined){
                onCheck(childList,index + 1)
            }
        }
    }
    xhr.onerror = () => {
        alert('タグ検索に失敗しました')
    }
    const url = new URL('https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search')
    url.searchParams.set('q',child.notifyData)
    url.searchParams.set('targets','tags')
    url.searchParams.set('fields','contentId,startTime')
    // url.searchParams.set('filters[startTime][gte]',new Date(child.lastCheck).toISOString())
    url.searchParams.set('_sort','-startTime')
    url.searchParams.set('_limit',1)
    url.searchParams.set('_context','HamNicoVideo')
    xhr.open('GET', url)
    xhr.responseType = 'json'

    xhr.send()
}
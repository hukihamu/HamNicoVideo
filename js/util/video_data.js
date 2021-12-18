class VideoView {
    constructor(child, videoData) {
        this.child = child
        this.videoData = videoData
    }

    static importVideoView(object) {
        return new VideoView(object.child, object.videoData)
    }

    createView(parent) {
        const div = document.createElement('div')
        div.id = this.child.notifyId
        this.createHeader(div)
        this.createBody(div)
        parent.appendChild(div)
    }

    createHeader(parent) {

        const target = document.createElement('div')
        target.className = 'target'
        if (this.child.isNotify) {
            target.classList.add('target-highlight')
        }

        //タイトル
        const targetTypeDiv = document.createElement('div')
        targetTypeDiv.className = 'target-type'
        const nameA = document.createElement('a')
        nameA.innerText = this.child.dataName
        nameA.href = this.child.flag === 'series'
            ? 'https://www.nicovideo.jp/series/' + this.child.notifyData
            : 'https://www.nicovideo.jp/tag/'  + this.child.notifyData
        nameA.target = '_blank'
        targetTypeDiv.appendChild(nameA)

        //操作
        const targetOperation = document.createElement('div')
        targetOperation.className = 'target-operation'

        const reload = (object)=>{
            const videoView = VideoView.importVideoView(object)
            const notifyElm = parent.getElementsByClassName('notification')[0]
            if (notifyElm) notifyElm.remove()
            this.child = videoView.child
            this.videoData = videoView.videoData
            this.createBody(parent)
            if (videoView.videoData){
                if (this.child.isNotify) {
                    target.classList.add('target-highlight')
                }
            }
            parent.classList.remove('child-loading')
        }

        //Next
        const nextButton = document.createElement('button')
        nextButton.innerText = 'Next'
        nextButton.className = 'next_button'
        nextButton.addEventListener('click', () => {
            browserInstance.runtime.sendMessage({key: 'video-next',value: this.child.notifyId},reload)
        })

        //prev
        const prevButton = document.createElement('button')
        prevButton.innerText = 'Prev'
        prevButton.className = 'prev_button'
        prevButton.addEventListener('click', () => {
            parent.classList.add('child-loading')
            browserInstance.runtime.sendMessage({key: 'video-prev',value: this.child.notifyId},reload)
        })

        //既読
        const notifyRead = document.createElement('button')
        notifyRead.innerText = '既読'
        notifyRead.className = 'notify-read'
        notifyRead.addEventListener('click', () => {
            browserInstance.runtime.sendMessage({key: 'notify-read',value: this.child.notifyId},()=>{
                target.classList.remove('target-highlight')
            })
        })
        //リフレッシュ
        const refreshButton = document.createElement('button')
        refreshButton.innerText = 'リフレッシュ'
        refreshButton.className = 'refresh'
        refreshButton.addEventListener('click', () => {
            parent.classList.add('child-loading')
            browserInstance.runtime.sendMessage({key: 'refresh',value: this.child.notifyId},reload)
        })


        //編集
        const editButton = document.createElement('button')
        editButton.innerText = '編集'
        editButton.className = 'edit_button'
        editButton.addEventListener('click', () => {
            window.location.href = '/html/edit_notification.html?edit=' + this.child.notifyId
        })

        const row1 = document.createElement('ul')
        row1.className = 'operation-row'
        const cell1 = document.createElement('li')
        cell1.appendChild(nextButton)
        const cell2 = document.createElement('li')
        cell2.appendChild(prevButton)
        row1.appendChild(cell1)
        row1.appendChild(cell2)
        const row2 = document.createElement('ul')
        row2.className = 'operation-row'
        const cell3 = document.createElement('li')
        cell3.appendChild(notifyRead)
        const cell4 = document.createElement('li')
        cell4.appendChild(refreshButton)
        const cell5 = document.createElement('li')
        cell5.appendChild(editButton)
        row2.appendChild(cell3)
        row2.appendChild(cell4)
        row2.appendChild(cell5)

        targetOperation.appendChild(row1)
        targetOperation.appendChild(row2)


        target.appendChild(targetTypeDiv)
        target.appendChild(targetOperation)
        parent.appendChild(target)
    }

    createBody(parent) {
        const row = document.createElement('div')
        row.className = 'notification'
        parent.appendChild(row)

        if (!this.videoData) return

        const d1 = document.createElement('div')
        d1.className = 'NC-MediaObject NC-VideoMediaObject SeriesVideoListContainer-video'
        row.appendChild(d1)

        const d2 = document.createElement('div')
        d2.className = 'NC-MediaObject-main'
        d1.appendChild(d2)

        const a3 = document.createElement('a')
        a3.className = 'NC-Link NC-MediaObject-contents'
        a3.href = this.videoData.url
        a3.rel = 'noopener'
        a3.target = '_blank'
        a3.addEventListener('click', () => {
            browserInstance.runtime.sendMessage({key: 'notify-read',value: this.child.notifyId},()=>{
                browserInstance.runtime.sendMessage({key: 'video-next',value: this.child.notifyId})
            })
        })
        d2.appendChild(a3)

        const d4_1 = document.createElement('div')
        d4_1.className = 'NC-MediaObject-media'
        a3.appendChild(d4_1)

        const d5_1 = document.createElement('div')
        d5_1.className = 'NC-MediaObject-media'
        d4_1.appendChild(d5_1)

        const d6_1 = document.createElement('div')
        d6_1.className = 'NC-VideoMediaObject-thumbnail'
        d5_1.appendChild(d6_1)

        const d7_1 = document.createElement('div')
        d7_1.className = 'NC-NicoadFrame SeriesVideoListContainer-video'
        d6_1.appendChild(d7_1)

        const d8_1 = document.createElement('div')
        d8_1.className = 'NC-Thumbnail NC-VideoThumbnail NC-Thumbnail_sizeCover'
        d7_1.appendChild(d8_1)

        const d9_1 = document.createElement('div')
        d9_1.className = 'NC-Thumbnail-image'
        d9_1.role = 'img'
        d9_1.setAttribute('aria-label', this.videoData.name)
        d9_1.style = `background-image: url('${this.videoData.thumbnail}.L');`//サムネ
        d8_1.appendChild(d9_1)

        const d9_2 = document.createElement('div')
        d9_2.className = 'NC-VideoPlaybackIndicator'
        d8_1.appendChild(d9_2)
        const d10_1 = document.createElement('div')
        d10_1.className = 'NC-VideoPlaybackIndicator-inner'
        const d9_3 = document.createElement('div')
        d9_3.className = 'NC-VideoLength'
        d9_3.innerText = this.videoData.length //動画時間
        d8_1.appendChild(d9_3)
        const d9_4 = document.createElement('div')
        d9_4.className = 'NC-VideoThumbnailComment'
        d8_1.appendChild(d9_4)


        const d4_2 = document.createElement('div')
        d4_2.className = 'NC-MediaObject-body'
        a3.appendChild(d4_2)

        const d5_2 = document.createElement('div')
        d5_2.className = 'NC-MediaObject-bodyTitle'
        d4_2.appendChild(d5_2)
        const h6_1 = document.createElement('h2')
        h6_1.className = 'NC-MediaObjectTitle NC-VideoMediaObject-title NC-MediaObjectTitle_fixed2Line'
        h6_1.innerText = this.videoData.name// タイトル
        d5_2.appendChild(h6_1)


        const d5_3 = document.createElement('div')
        d5_3.className = 'NC-MediaObject-bodySecondary'
        d4_2.appendChild(d5_3)

        const d6_2 = document.createElement('div')
        d6_2.className = 'NC-VideoMediaObject-description'
        d6_2.textContent = this.videoData.description//動画説明
        d5_3.appendChild(d6_2)

        const d6_3 = document.createElement('div')
        d6_3.className = 'NC-VideoMediaObject-meta'
        d5_3.appendChild(d6_3)

        const d7_2 = document.createElement('div')
        d7_2.className = 'NC-VideoMediaObject-metaAdditional'
        d6_3.appendChild(d7_2)

        const s8 = document.createElement('span')
        s8.className = 'NC-VideoRegisteredAtText'
        const videoRegister = new Date(this.videoData.uploadDate)
        s8.innerText = `${videoRegister.getFullYear().toString().padStart(4, '0')}/${videoRegister.getMonth().toString().padStart(2, '0')}/${videoRegister.getDate().toString().padStart(2, '0')} ${videoRegister.getHours().toString().padStart(2, '0')}:${videoRegister.getMinutes().toString().padStart(2, '0')}` //投稿時間
        d7_2.appendChild(s8)
        const s9 = document.createElement('span')
        s9.className = 'NC-VideoRegisteredAtText-text'
        s8.appendChild(s9)
        const d8_2 = document.createElement('div')
        d8_2.className = 'NC-VideoLabels'
        d7_2.appendChild(d8_2)
        if (this.videoData.isCH){
            //チャンネル
            const d9_5 = document.createElement('div')
            d9_5.className = 'NC-VideoLabels-label NC-VideoLabels-channel'
            d9_5.innerText = 'CH'
            d8_2.appendChild(d9_5)
        }
        if (this.videoData.isPremiumOnly){
            //プレ限
            const d9_5 = document.createElement('div')
            d9_5.className = 'NC-PremiumOnlyLabel SeriesVideoListContainer-video'
            d8_2.appendChild(d9_5)

            const s10_1 = document.createElement('span')
            s10_1.className = 'NC-PremiumOnlyLabel-icon'
            d9_5.appendChild(s10_1)

            const s10_2 = document.createElement('span')
            s10_2.innerText = '限定'
            d9_5.appendChild(s10_2)


        }else if(this.videoData.isNotFree){
            //有料
            const d9_5 = document.createElement('div')
            d9_5.className = 'NC-VideoLabels-label NC-VideoLabels-paid'
            d9_5.innerText = '有料'
            d8_2.appendChild(d9_5)
        }

        const d7_3 = document.createElement('div')
        d7_3.className = 'NC-VideoMediaObject-metaCount'
        d6_3.appendChild(d7_3)

        const d8_3 = document.createElement('div')
        d8_3.className = 'NC-VideoMetaCount NC-VideoMetaCount_view'
        d8_3.innerText = this.videoData.watchCount//再生数
        d7_3.appendChild(d8_3)
        const d8_4 = document.createElement('div')
        d8_4.className = 'NC-VideoMetaCount NC-VideoMetaCount_comment'
        d8_4.innerText = this.videoData.commentCount//コメント数
        d7_3.appendChild(d8_4)
        const d8_5 = document.createElement('div')
        d8_5.className = 'NC-VideoMetaCount NC-VideoMetaCount_like'
        d8_5.innerText = this.videoData.likeCount//いいね吸う
        d7_3.appendChild(d8_5)
        const d8_6 = document.createElement('div')
        d8_6.className = 'NC-VideoMetaCount NC-VideoMetaCount_mylist'
        d8_6.innerText = this.videoData.mylistCount//マイリス数
        d7_3.appendChild(d8_6)
    }
}


class VideoData {

    constructor(videoId, name, description, url, uploadDate, length, watchCount, mylistCount, commentCount, likeCount, isCH, isFree, isPremiumOnly, thumbnail, playbackIndicator) {
        this.videoId = videoId
        this.name = name
        this.description = description
        this.url = url
        this.uploadDate = uploadDate
        this.length = length
        this.watchCount = watchCount
        this.mylistCount = mylistCount
        this.commentCount = commentCount
        this.likeCount = likeCount
        this.isCH = isCH
        this.isNotFree = isFree
        this.isPremiumOnly = isPremiumOnly
        this.thumbnail = thumbnail
        this.playbackIndicator = playbackIndicator
    }

    static async getSeries(id) {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest()
            xhr.onreadystatechange = async () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(await this.seriesDocToInstance(xhr.response))
                }
            }

            xhr.open('get', 'https://www.nicovideo.jp/series/' + id)
            xhr.responseType = 'document'
            xhr.send()
        })
    }

    static async seriesDocToInstance(document) {
        const result = []
        for (const media of document.getElementsByClassName('NC-MediaObject NC-VideoMediaObject SeriesVideoListContainer-video')) {
            //日付、各カウント、サムネ
            const url = media.getElementsByClassName('NC-Link NC-MediaObject-contents')[0].href
            const videoId = url.replace('https://www.nicovideo.jp/watch/', '')
            const detail = await this.getDetail(videoId)
            result.push(new VideoData(
                videoId,
                detail.getElementsByTagName('title')[0].textContent,
                media.getElementsByClassName('NC-VideoMediaObject-description')[0].textContent,
                url,
                detail.getElementsByTagName('first_retrieve')[0].textContent,
                detail.getElementsByTagName('length')[0].textContent,
                media.getElementsByClassName('NC-VideoMetaCount_view')[0].textContent,
                media.getElementsByClassName('NC-VideoMetaCount_mylist')[0].textContent,
                media.getElementsByClassName('NC-VideoMetaCount_comment')[0].textContent,
                media.getElementsByClassName('NC-VideoMetaCount_like')[0].textContent,
                media.getElementsByClassName('NC-VideoLabels-channel')[0] !== undefined,
                media.getElementsByClassName('NC-VideoLabels-paid')[0] !== undefined,
                media.getElementsByClassName('NC-PremiumOnlyLabel')[0] !== undefined,
                detail.getElementsByTagName('thumbnail_url')[0].textContent
            ))
        }
        return result
    }

    static async getTags(tag, lastVideoId, _result, page, isLastLoop) {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest()
            xhr.onreadystatechange = async () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let {allVideoCount,result,isLastVideo} = await this.tagDocToInstance(xhr.response,tag,lastVideoId,_result)
                    const isFullSearch = allVideoCount <= result.length
                    const isFindLast = result[result.length - 1].videoId === lastVideoId
                    if (!isFullSearch){
                        if (lastVideoId && !isLastVideo && !isLastLoop){
                            result = await this.getTags(tag,lastVideoId,result,page + 1)
                        }
                        if (isFindLast){
                            result = await this.getTags(tag,lastVideoId,result,page + 1,true)
                        }
                    }
                    resolve(result)
                }
            }
            xhr.open('get', 'https://www.nicovideo.jp/tag/'  + tag + '?sort=f&page=' + page)
            xhr.responseType = 'document'
            xhr.send()
        })
    }
    static async tagDocToInstance(document, tag, lastVideoId, result){

        const allVideoCount = document.getElementsByClassName('tagFollowArea')[0].parentElement.getElementsByClassName('num')[0].innerText
        const contentBody = document.getElementsByClassName('contentBody video uad videoList videoList01')[0]
        const dataVideoList = contentBody.children[1]
        const adList = dataVideoList.getElementsByClassName('item nicoadVideoItem')
        while (adList.length){
            adList[0].remove()
        }
        let isLastVideo = false
        for (const item of dataVideoList.children){
            const videoId = item.dataset.videoId
            isLastVideo = isLastVideo || (videoId === lastVideoId)
            const detail = await this.getDetail(videoId)
            const a = item.getElementsByClassName('itemTitle')[0].children[0]
            let isPremium = false
            for (const tagElm of detail.getElementsByTagName('tag')){
                 if (tagElm.innerText === 'プレミアム限定動画（プレミアム）' && tagElm.lock === "1"){
                     isPremium = true
                     break
                 }
            }
            result.push(new VideoData(
                videoId,
                a.title,
                item.getElementsByClassName('itemDescription')[0].textContent,
                a.href,
                item.getElementsByClassName('time')[0].textContent,
                item.getElementsByClassName('videoLength')[0].textContent,
                item.getElementsByClassName('count view')[0].children[0].textContent,
                item.getElementsByClassName('count mylist')[0].children[0].textContent,
                item.getElementsByClassName('count comment')[0].children[0].textContent,
                item.getElementsByClassName('count like')[0].children[0].textContent,
                detail.getElementsByTagName('ch_id')[0] !== undefined,
                item.getElementsByClassName('iconPayment')[0] !== undefined,
                isPremium,
                detail.getElementsByTagName('thumbnail_url')[0].textContent
            ))
        }
        return {
            result,
            isLastVideo,
            allVideoCount
        }
    }

    static async getDetail(videoId) {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest()
            const url = new URL('https://ext.nicovideo.jp/api/getthumbinfo/' + videoId)

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(xhr.responseXML)
                }
            }
            xhr.open('GET', url)
            xhr.send()
        })
    }
}
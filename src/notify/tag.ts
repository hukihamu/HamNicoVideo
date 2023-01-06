import {BackgroundNotify, CachePostData, InputNotify, NotifyTypeArray, OptionNotify} from '@/notify/notify'
import {
    NotifyDetailSeries,
    NotifyDetailTag,
    ValuesNotify
} from '@/storage/parameters/values_type/values_notify'
import {WatchDetailType} from '@/nico_client/watch_detail';
import {NotifyPostData} from '@/post_data/notify_post_data';
import {VideoDetailPostData} from '@/post_data/video_detail_post_data';
import {NicoAPI} from '@/nico_client/nico_api';
import {doc} from '@/window';
import Util from '@/util'
export class TagInputNotify implements InputNotify{
    initNotifyDetail(): NotifyDetailTag | undefined {
        return {
            searchTagText: '',
            lastCheckPage: 1
        }
    }

    createNotifyDetail(watchDetail: WatchDetailType): NotifyDetailTag {
        return {
            searchTagText: (doc.getElementById('search-tag-text') as HTMLInputElement).value,
            lastCheckPage: 1
        }
    }
    createNotifyDetailElement(): HTMLDivElement {
        const div = document.createElement('div')
        const searchTagTextLabel = document.createElement('label')
        searchTagTextLabel.setAttribute('for','search-tag-text')
        searchTagTextLabel.textContent = 'タグ:'
        const searchTagTextInput = document.createElement('input')
        searchTagTextInput.type = 'text'
        searchTagTextInput.id = 'search-tag-text'
        searchTagTextInput.required = true
        searchTagTextInput.style.width = '80%'

        div.appendChild(searchTagTextLabel)
        div.appendChild(searchTagTextInput)
        return div
    }
    showWatchDetail(watchDetail: WatchDetailType) {
        (doc.getElementById('search-tag-text') as HTMLInputElement).value = watchDetail.data.tag.items.map(it => it.name).join(' ')
    }
    showNotifyDetail(notifyDetail: NotifyDetailTag) {
        const input = doc.getElementById('search-tag-text') as HTMLInputElement
        input.value = notifyDetail.searchTagText
        Util.setReadonly(input)
    }
    setNotifyDetail(notifyDetail: NotifyDetailTag) {
        notifyDetail.searchTagText = (doc.getElementById('search-tag-text') as HTMLInputElement).value
    }
}
export class TagBackgroundNotify implements BackgroundNotify{
    private detail: NotifyDetailTag
    constructor(private valuesNotify: ValuesNotify,private cache: CachePostData) {
        this.detail = valuesNotify.config.notifyDetail as NotifyDetailTag
    }
    async setCache(): Promise<void> {
        this.mergeCache(await NicoAPI.getSearchTagPage(this.detail.searchTagText, this.detail.lastCheckPage))
        this.mergeCache(await NicoAPI.getSearchTagNewPage(this.detail.searchTagText))
    }
    async currentVideoDetailPostData(): Promise<VideoDetailPostData | undefined> {
        const items = this.cache[this.valuesNotify.config.valueId]
        let resultItem: VideoDetailPostData | undefined = undefined
        if (this.valuesNotify.config.lastWatchId){
            let lastWatchIndex = items.findIndex(it => it?.watchId === this.valuesNotify.config.lastWatchId)
            if (lastWatchIndex === -1){

                if (Util.calcTagSearchStartIndex(this.detail.lastCheckPage + 1) < items.length) {
                    this.detail.lastCheckPage++
                    await this.setCache()
                    this.detail.lastCheckPage--
                }
                if (this.detail.lastCheckPage > 1) {
                    this.detail.lastCheckPage--
                    await this.setCache()
                    this.detail.lastCheckPage++
                }
                lastWatchIndex = items.findIndex(it => it?.watchId === this.valuesNotify.config.lastWatchId)
            }
            if (0 <= lastWatchIndex && lastWatchIndex < items.length - 1) {
                if (items[lastWatchIndex + 1]){
                    // 1つ後が存在している
                    resultItem = items[lastWatchIndex + 1]
                }else {
                    // 1つ後が存在しない => currentPageを増やして取得
                    if (Util.calcTagSearchStartIndex(this.detail.lastCheckPage + 1) < items.length){
                        this.detail.lastCheckPage++
                        await this.setCache()
                        this.detail.lastCheckPage--
                        resultItem = items[lastWatchIndex + 1]
                    }
                }
            }
            if (resultItem) {
                await this.fillLackData(resultItem)
            }
        }
        return resultItem
    }
    async firstVideoDetailPostData(): Promise<VideoDetailPostData | undefined> {
        const items = this.cache[this.valuesNotify.config.valueId]
        const resultItem = items[0]
        if (resultItem) {
            await this.fillLackData(resultItem)
        }
        return resultItem
    }
    async nextWatchId(): Promise<void> {
        const items = this.cache[this.valuesNotify.config.valueId]
        if (!this.valuesNotify.config.lastWatchId) {
            this.valuesNotify.config.lastWatchId = items[0]?.watchId
            return
        }
        const lastWatchIndex = items.findIndex(it => it?.watchId === this.valuesNotify.config.lastWatchId)
        if (0 <= lastWatchIndex && lastWatchIndex < items.length - 1) {
            if (items[lastWatchIndex + 1]){
                // 1つ後が存在している => 1つ後をセット
                this.valuesNotify.config.lastWatchId = items[lastWatchIndex + 1]?.watchId
            }
            if (!items[lastWatchIndex + 2]){
                // 2つ後が存在しない => currentPageを増やす
                if (Util.calcTagSearchStartIndex(this.detail.lastCheckPage + 1) < items.length){
                    this.detail.lastCheckPage++
                    await this.setCache()
                }
            }
        }
        return
    }
    async prevWatchId(): Promise<void> {
        const items = this.cache[this.valuesNotify.config.valueId]
        const lastWatchIndex = items.findIndex(it => it?.watchId === this.valuesNotify.config.lastWatchId)
        if (lastWatchIndex > 0) {
            if (items[lastWatchIndex - 1]){
                // 1つ前が存在している
                this.valuesNotify.config.lastWatchId = items[lastWatchIndex - 1]?.watchId
            }else {
                // 1つ前が存在しない => currentPageを減らして取得
                if (this.detail.lastCheckPage > 1){
                    this.detail.lastCheckPage--
                    await this.setCache()
                    this.valuesNotify.config.lastWatchId = items[lastWatchIndex - 1]?.watchId
                } else {
                    this.valuesNotify.config.lastWatchId = undefined
                }
            }
        }else {
            this.valuesNotify.config.lastWatchId = undefined
        }
        return
    }
    async isNewVideo(): Promise<boolean> {
        const items = this.cache[this.valuesNotify.config.valueId]
        for (let i = items.length - 1; i >= 0; i--){
            const item = items[i]
            if (item){
                await this.fillLackData(item)
                return new Date(item.firstRetrieve).getTime() > new Date(this.valuesNotify.config.lastCheckDateTime).getTime()
            }
        }
        return false
    }
    createNotifyPostData(): NotifyPostData {
        return {
            valueId: this.valuesNotify.config.valueId,
            title: this.detail.searchTagText,
            titleLink: 'https://www.nicovideo.jp/tag/' + this.detail.searchTagText
        }
    }
    private mergeCache(data: (VideoDetailPostData|undefined)[]){
        if (!this.cache[this.valuesNotify.config.valueId]) this.cache[this.valuesNotify.config.valueId] = []
        for (let i = 0; i < data.length;i++){
            if (data[i]){
                this.cache[this.valuesNotify.config.valueId][i] = data[i]
            }else if(this.cache[this.valuesNotify.config.valueId].length <= i){
                this.cache[this.valuesNotify.config.valueId][i] = data[i]
            }
        }
    }
    private async fillLackData(data: VideoDetailPostData) {
        if (data.firstRetrieve === ''){
            const wd = await NicoAPI.getWatchDetail(data.watchId)
            data.firstRetrieve = wd.data.video.registeredAt
            data.thumbnailUrl = wd.data.video.thumbnail.url
            data.description = wd.data.video.description
        }
    }
}
export class TagOptionNotify implements OptionNotify {

    private detail: NotifyDetailTag
    constructor(private valuesNotify: ValuesNotify) {
        this.detail = valuesNotify.config.notifyDetail as NotifyDetailTag
    }
    getType(): string {
        return NotifyTypeArray.find(it => it.key === 'tag')?.name ?? ''
    }
    getName(): string {
        return this.detail.searchTagText
    }
    getUrl(): string {
        return 'https://www.nicovideo.jp/tag/' + this.detail.searchTagText
    }
}
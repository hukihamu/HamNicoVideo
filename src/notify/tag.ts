import {BackgroundNotify, CachePostData, InputNotify} from '@/notify/notify';
import {
    NotifyDetailTag,
    ValuesNotify
} from '@/storage/parameters/values_type/values_notify';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {NotifyPostData} from '@/post_data/notify_post_data';
import {VideoDetailPostData} from '@/post_data/video_detail_post_data';
import {NicoAPI} from '@/nico_client/nico_api';
import {doc} from '@/window';

export class TagInputNotify implements InputNotify{
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
        searchTagTextInput.style.width = '80%'

        div.appendChild(searchTagTextLabel)
        div.appendChild(searchTagTextInput)
        return div
    }
    showWatchDetail(watchDetail: WatchDetailType) {
        (doc.getElementById('search-tag-text') as HTMLInputElement).value = watchDetail.data.tag.items.map(it => it.name).join(' ')
    }
    showNotifyDetail(notifyDetail: NotifyDetailTag) {
        (doc.getElementById('search-tag-text') as HTMLInputElement).value = notifyDetail.searchTagText
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
    }
    async currentVideoDetailPostData(): Promise<VideoDetailPostData | undefined> {
        return // TODO
    }
    async firstVideoDetailPostData(): Promise<VideoDetailPostData | undefined> {
        return // TODO
    }
    async nextWatchId(): Promise<void> {
        return // TODO
    }
    async prevWatchId(): Promise<void> {
        return // TODO
    }
    async isNewVideo(): Promise<boolean> {
        return false // TODO
    }
    createNotifyPostData(): NotifyPostData {
        return {
            valueId: this.valuesNotify.config.valueId,
            title: this.detail.searchTagText,
            titleLink: 'https://www.nicovideo.jp/tag/' + this.detail.searchTagText
        }
    }
    private mergeCache(data: (VideoDetailPostData|undefined)[]){
        for (let i = 0; i < data.length;i++){
            if (data[i]){
                this.cache[this.valuesNotify.config.valueId][i] = data[i]
            }
        }
    }
}
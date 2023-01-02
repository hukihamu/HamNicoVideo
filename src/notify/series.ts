import {doc} from '@/window';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {
    ValuesNotify,
    NotifyDetailSeries
} from '@/storage/parameters/values_type/values_notify';
import {NicoAPI} from '@/nico_client/nico_api';
import {NotifyPostData} from '@/post_data/notify_post_data';
import {BackgroundNotify, CachePostData, InputNotify} from '@/notify/notify';
import {VideoDetailPostData} from '@/post_data/video_detail_post_data';
import Util from '@/util';

export class SeriesInputNotify implements InputNotify {
    createNotifyDetail(watchDetail: WatchDetailType): NotifyDetailSeries {
        return {
            seriesId: watchDetail.data.series.id.toString(),
            seriesName: watchDetail.data.series.title,
            isReverse: (doc.getElementById('is-reverse') as HTMLInputElement).checked
        }
    }
    createNotifyDetailElement(): HTMLDivElement {
        const div = document.createElement('div')
        const seriesNameLabel = document.createElement('label')
        seriesNameLabel.textContent = 'シリーズ名:'
        seriesNameLabel.setAttribute('for', 'series-name')
        const seriesIdInput = document.createElement('input')
        seriesIdInput.type = 'hidden'
        seriesIdInput.id = 'series-id'
        const seriesNameInput = document.createElement('input')
        seriesNameInput.id = 'series-name'
        seriesNameInput.required = true
        seriesNameInput.style.width = '80%'
        Util.setReadonly(seriesNameInput)

        const isReverseLabel = document.createElement('label')
        isReverseLabel.setAttribute('for','is-reverse')
        isReverseLabel.textContent = '順序反転'
        const isReverseInput = document.createElement('input')
        isReverseInput.type = 'checkbox'
        isReverseInput.id = 'is-reverse'

        div.appendChild(seriesNameLabel)
        div.appendChild(seriesIdInput)
        div.appendChild(seriesNameInput)
        div.appendChild(isReverseLabel)
        div.appendChild(isReverseInput)
        return div
    }
    showWatchDetail(watchDetail: WatchDetailType) {
        (doc.getElementById('series-id') as HTMLInputElement).value = watchDetail.data.series.id.toString()
        const name = doc.getElementById('series-name') as HTMLInputElement
        name.value = watchDetail.data.series.title
    }
    showNotifyDetail(notifyDetail: NotifyDetailSeries) {
        (doc.getElementById('series-id') as HTMLInputElement).value = notifyDetail.seriesId
        const name = doc.getElementById('series-name') as HTMLInputElement
        name.value = notifyDetail.seriesName
        const input = doc.getElementById('is-reverse') as HTMLInputElement
        input.checked = notifyDetail.isReverse
    }
    setNotifyDetail(notifyDetail: NotifyDetailSeries) {
        notifyDetail.seriesId = (doc.getElementById('series-id') as HTMLInputElement).value
        notifyDetail.seriesName = (doc.getElementById('series-name') as HTMLInputElement).value
        notifyDetail.isReverse = (doc.getElementById('is-reverse') as HTMLInputElement).checked
    }
}
export class SeriesBackgroundNotify implements BackgroundNotify{
    private detail: NotifyDetailSeries
    constructor(private valuesNotify: ValuesNotify,private cache: CachePostData) {
        this.detail = valuesNotify.config.notifyDetail as NotifyDetailSeries
    }
    setCache = async (): Promise<void> => {
        this.cache[this.valuesNotify.config.valueId] = await NicoAPI.getSeries(this.detail.seriesId)
    }
    currentVideoDetailPostData = async (): Promise<VideoDetailPostData | undefined> =>{
        const items = this.cache[this.valuesNotify.config.valueId].concat()
        if (this.detail.isReverse) items.reverse()
        let isLastWatchId = false

        for (const item of items){
            if (!item) continue
            if (isLastWatchId){
                // 最終確認の次
                return item
            }
            isLastWatchId = item.watchId === this.valuesNotify.config.lastWatchId
        }
        return
    }
    firstVideoDetailPostData = async (): Promise<VideoDetailPostData | undefined> => {
        const items = this.cache[this.valuesNotify.config.valueId].concat()
        if (this.detail.isReverse) items.reverse()
        const item = items[0]
        if (item){
            return item
        }
        return
    }
    nextWatchId = async (): Promise<void> => {
        const items = this.cache[this.valuesNotify.config.valueId].concat()
        if (this.detail.isReverse) items.reverse()
        if (!this.valuesNotify.config.lastWatchId) {
            this.valuesNotify.config.lastWatchId = items[1]?.watchId
            return
        }
        let isLastWatchData = false
        let isNext = false
        for (const item of items){
            if (!item) continue
            if (isLastWatchData){
                // 最終確認の次
                isNext = true
            }
            if (isNext){
                // 最終確認の次の次
                this.valuesNotify.config.lastWatchId = item.watchId
                return
            }
            isLastWatchData = item.watchId === this.valuesNotify.config.lastWatchId
        }
        return
    }
    prevWatchId = async (): Promise<void> => {
        const items = this.cache[this.valuesNotify.config.valueId].concat()
        if (!this.detail.isReverse) items.reverse() // デフォで反転
        let isLastWatchData = false
        for (const item of items){
            if (!item) continue
            if (isLastWatchData){
                // 最終確認の前
                this.valuesNotify.config.lastWatchId = item.watchId
                return
            }
            isLastWatchData = item.watchId === this.valuesNotify.config.lastWatchId
        }
        const firstItem = items[items.length - 1]
        if (firstItem) this.valuesNotify.config.lastWatchId = firstItem.watchId
        return
    }
    isNewVideo = async (): Promise<boolean> => {
        const items = this.cache[this.valuesNotify.config.valueId].concat()
        if (this.detail.isReverse) items.reverse()
        const item = items[items.length - 1]
        if (item){
            return new Date(item.firstRetrieve).getTime() > new Date(this.valuesNotify.config.lastCheckDateTime).getTime()
        }
        return false
    }
    createNotifyPostData(): NotifyPostData {
        return {
            valueId: this.valuesNotify.config.valueId,
            title: this.detail.seriesName,
            titleLink: 'https://www.nicovideo.jp/series/' + this.detail.seriesId
        }
    }
}
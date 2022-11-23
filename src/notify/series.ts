import {doc} from '@/window';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {
    ValuesNotify,
    NotifyDetailSeries
} from '@/storage/parameters/values_type/values_notify';
import {NicoAPI} from '@/nico_client/nico_api';
import {NotifyPostData} from '@/post_data/notify_post_data';
import {BackgroundNotify, CacheNotify, InputNotify} from '@/notify/notify';
import {VideoDetailPostData} from '@/post_data/video_detail_post_data';

export class SeriesBackgroundNotify implements BackgroundNotify{
    private detail: NotifyDetailSeries
    constructor(private valuesNotify: ValuesNotify,private cache: CacheNotify) {
        this.detail = valuesNotify.config.notifyDetail as NotifyDetailSeries
    }
    setCache = async (): Promise<void> => {
        this.cache[this.valuesNotify.config.valueId] = await NicoAPI.getSeries(this.detail.seriesId)
    }
    currentVideoDetailPostData = (): VideoDetailPostData | undefined =>{
        const items = this.cache[this.valuesNotify.config.valueId].data.items
        if (this.detail.isReverse) items.reverse()
        let isLastWatchId = false

        for (const item of items){
            if (isLastWatchId){
                // 最終確認の次
                if (this.detail.isReverse) items.reverse()
                return convertPostData(item)
            }
            isLastWatchId = item.video.id === this.valuesNotify.config.lastWatchId
        }
        if (this.detail.isReverse) items.reverse()
        return
    }
    firstVideoDetailPostData = (): VideoDetailPostData | undefined => {
        const items = this.cache[this.valuesNotify.config.valueId].data.items
        if (this.detail.isReverse) items.reverse()
        const item = items[0]
        if (item){
            if (this.detail.isReverse) items.reverse()
            return convertPostData(item)
        }
        if (this.detail.isReverse) items.reverse()
        return
    }

    isNewVideo = (): boolean => {
        const items = this.cache[this.valuesNotify.config.valueId].data.items
        if (this.detail.isReverse) items.reverse()
        const item = items[items.length - 1]
        if (item){
            if (this.detail.isReverse) items.reverse()
            return new Date(item.video.registeredAt).getTime() > new Date(this.valuesNotify.config.lastCheckDateTime).getTime()
        }
        if (this.detail.isReverse) items.reverse()
        return false
    }
    getNextWatchId = (): string | undefined => {
        const items = this.cache[this.valuesNotify.config.valueId].data.items
        if (this.detail.isReverse) items.reverse()
        if (!this.valuesNotify.config.lastWatchId) return items[1]?.video.id
        let isLastWatchData = false
        let isNext = false
        for (const item of items){
            if (isLastWatchData){
                // 最終確認の次
                isNext = true
            }
            if (isNext){
                // 最終確認の次の次
                if (this.detail.isReverse) items.reverse()
                return item.video.id
            }
            isLastWatchData = item.video.id === this.valuesNotify.config.lastWatchId
        }
        if (this.detail.isReverse) items.reverse()
        return
    }
    getPrevWatchId = (): string | undefined => {
        const items = this.cache[this.valuesNotify.config.valueId].data.items
        if (!this.detail.isReverse) items.reverse() // デフォで反転
        let isLastWatchData = false
        for (const item of items){
            if (isLastWatchData){
                // 最終確認の前
                if (!this.detail.isReverse) items.reverse()
                return item.video.id
            }
            isLastWatchData = item.video.id === this.valuesNotify.config.lastWatchId
        }
        if (!this.detail.isReverse) items.reverse()
        return
    }
    createNotifyPostData(): NotifyPostData {
        return {
            valueId: this.valuesNotify.config.valueId,
            title: this.detail.seriesName,
            titleLink: 'https://www.nicovideo.jp/series/' + this.detail.seriesId
        }
    }
}
const convertPostData = (series: any): VideoDetailPostData=>{
    return {
        watchId: series.video.id,
        title: series.video.title,
        viewCounter: series.video.count.view,
        commentNum: series.video.count.comment,
        likeCounter: series.video.count.like,
        myListCounter: series.video.count.mylist,
        isCH: series.video.isChannelVideo,
        thumbnailUrl: series.video.thumbnail.url,
        description: series.video.shortDescription,
        isPaid: series.video.isPaymentRequired,
        firstRetrieve: series.video.registeredAt,
        length: series.video.duration,
        isPremiumOnly: series.video.acf68865
    }
}
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
        const seriesNameDiv = document.createElement('div')
        seriesNameDiv.id = 'series-name'
        seriesNameDiv.textContent = 'シリーズ名:'
        const isReverseLabel = document.createElement('label')
        isReverseLabel.setAttribute('for','is-reverse')
        isReverseLabel.textContent = '順序反転'
        const isReverseInput = document.createElement('input')
        isReverseInput.type = 'checkbox'
        isReverseInput.id = 'is-reverse'

        div.appendChild(seriesNameDiv)
        div.appendChild(isReverseLabel)
        div.appendChild(isReverseInput)
        return div
    }
    showWatchDetail(watchDetail: WatchDetailType) {
        doc.getElementById('series-name').textContent = 'シリーズ名:' + watchDetail.data.series.title
    }
    showNotifyDetail(notifyDetail: NotifyDetailSeries) {
        doc.getElementById('series-name').textContent = 'シリーズ名:' + notifyDetail.seriesName
        const input = doc.getElementById('is-reverse') as HTMLInputElement
        input.checked = notifyDetail.isReverse
    }
    getInputNotifyDetail(notifyDetail: NotifyDetailSeries): NotifyDetailSeries {
        notifyDetail.isReverse = (doc.getElementById('is-reverse') as HTMLInputElement).checked
        return notifyDetail
    }
}
import {doc} from '@/window';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {
    NotifyDetail,
    ValuesNotify,
    ValuesNotifySeries
} from '@/storage/parameters/values_type/values_notify';
import {NicoAPI} from '@/nico_client/nico_api';
import util from '@/util';
import {NotifyPostData} from '@/post_data/notify_post_data';
import {Notify, NotifyDetailType, NotifyInterface} from '@/notify/notify';

export const NotifySeries: NotifyInterface = {
    EditNotify: {
        onChangeTargetType: (targetType: NotifyDetailType) => {
            const seriesDiv = doc.getElementById('series_value')
            seriesDiv.classList.toggle('hidden', targetType !== 'series')
        },
        createNotifyDetail: async (targetType: NotifyDetailType, watchDetailType: WatchDetailType): Promise<ValuesNotifySeries | undefined> => {
            if (targetType === 'series'){
                if (watchDetailType.data.series) return {
                    seriesId: watchDetailType.data.series.id.toString(),
                    seriesName: watchDetailType.data.series.title,
                }
                alert('シリーズを取得できませんでした')
            }
            return undefined
        },
        clearEditView: ()=>{
            const seriesNameSpan = doc.getElementById('series_name')
            seriesNameSpan.textContent = ''
        },
        initEditView: (notifyDetail: NotifyDetail): number | undefined => {
            if (util.isInstanceOf<ValuesNotifySeries>(notifyDetail, 'seriesName')) {
                const seriesNameSpan = doc.getElementById('series_name')
                seriesNameSpan.textContent = notifyDetail.seriesName
                return 0
            }
            return undefined
        }
    },
    Background: {
        createNotifyPostData(valuesNotify: ValuesNotify): NotifyPostData | undefined{
            if (util.isInstanceOf<ValuesNotifySeries>(valuesNotify.config.notifyDetail, 'seriesId')){
                return {
                    valueId: valuesNotify.config.valueId,
                    title: valuesNotify.config.notifyDetail.seriesName,
                    titleLink: 'https://www.nicovideo.jp/series/' + valuesNotify.config.notifyDetail.seriesId
                }
            }
            return undefined
        },
        async getCurrentWatchId(valuesNotify: ValuesNotify): Promise<string | undefined>{
            if (util.isInstanceOf<ValuesNotifySeries>(valuesNotify.config.notifyDetail, 'seriesId')) {
                if (valuesNotify.config.lastWatchId) {
                    // return (await getCacheWatchDetail(valuesNotify.config.lastWatchId)).data.series.video.next?.id
                } else {
                    if (util.isInstanceOf<ValuesNotifySeries>(valuesNotify.config.notifyDetail, 'seriesId')) {
                        // 最初の動画
                        return (await NicoAPI.getSeries(valuesNotify.config.notifyDetail.seriesId)).data.items[0].video.id
                    }
                }
            }
            return undefined
        },
        async getNextWatchId(valuesNotify: ValuesNotify, currentWatchId: string): Promise<string | undefined>{
            if (util.isInstanceOf<ValuesNotifySeries>(valuesNotify.config.notifyDetail, 'seriesId')) {
                return (await Notify.Background.getCacheWatchDetail(currentWatchId)).data.series.video.next?.id
            }
            return util.throwText('NotifyDetailが見つかりません')
        },
        async getPrevWatchId(valuesNotify: ValuesNotify, currentId: string): Promise<string | undefined>{
            if (util.isInstanceOf<ValuesNotifySeries>(valuesNotify.config.notifyDetail, 'seriesId')) {
                return (await Notify.Background.getCacheWatchDetail(currentId)).data.series.video.prev?.id
            }
            return util.throwText('NotifyDetailが見つかりません')
        },
        async getLastedWatchId(valuesNotify: ValuesNotify): Promise<WatchDetailType>{
            if (util.isInstanceOf<ValuesNotifySeries>(valuesNotify.config.notifyDetail, 'seriesId')) {
                const seriesData =  (await NicoAPI.getSeries(valuesNotify.config.notifyDetail.seriesId))
                // return getCacheWatchDetail(seriesData.data.items[seriesData.data.items.length - 1].video.id, true)
            }
            return util.throwText('NotifyDetailが見つかりません')
        }
    }
}
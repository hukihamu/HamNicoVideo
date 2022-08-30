import {doc} from '@/window';
import util from '@/util';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {NicoAPI} from '@/nico_client/nico_api';
import {
    NotifyDetail,
    ValueNotifyUserVideo,
    ValuesNotify,
    ValuesNotifySeries
} from '@/storage/parameters/values_type/values_notify';
import {NotifyPostData} from '@/post_data/notify_post_data';

export type NotifyDetailType = 'series' | 'user_video'


const cacheWatchDetail: { [watchId: string]: WatchDetailType } = {}
const getCacheWatchDetail = async (watchId: string, isReload: boolean = false): Promise<WatchDetailType>=>{
    if (isReload || !cacheWatchDetail[watchId]) cacheWatchDetail[watchId] = await NicoAPI.getWatchDetail(watchId)
    return cacheWatchDetail[watchId]
}


export const Notify = {
    EditNotify: {
        onChangeTargetType: (targetType: NotifyDetailType) => {
            const seriesDiv = doc.getElementById('series_value')
            const userVideoDiv = doc.getElementById('user_video_value')
            const tagsDiv = doc.getElementById('tags_value')
            seriesDiv.classList.toggle('hidden', targetType !== 'series')
            userVideoDiv.classList.toggle('hidden', targetType !== 'user_video')
            tagsDiv.classList.toggle('hidden', true)
        },
        createNotifyDetail: async (targetType: NotifyDetailType, watchDetailType: WatchDetailType): Promise<NotifyDetail | undefined> => {
            switch (targetType) {
                case 'series': {
                    if (watchDetailType.data.series) {
                        return {
                            seriesId: watchDetailType.data.series.id.toString(),
                            seriesName: watchDetailType.data.series.title,
                        }
                    } else {
                        alert('シリーズを取得できませんでした')
                    }
                    break
                }
                case 'user_video': {
                    // TODO
                    if (watchDetailType.data.channel) {
                        console.warn(await NicoAPI.getChannel(watchDetailType.data.channel.id.replace('ch', '')))
                    }
                    // return {
                    //   userId,
                    //   userName,
                    //   lastCheckIndex,
                    //   lastCheckTotalSize
                    // }

                    break
                }
            }
            return undefined
        },
        initEditView: (notifyDetail: NotifyDetail | undefined): number | undefined => {
            const seriesNameSpan = doc.getElementById('series_name')
            const userNameSpan = doc.getElementById('user_name')
            seriesNameSpan.textContent = ''
            userNameSpan.textContent = ''
            if (notifyDetail) {
                if (util.isInstanceOf<ValuesNotifySeries>(notifyDetail, 'seriesName')) {
                    // シリーズ
                    seriesNameSpan.textContent = notifyDetail.seriesName
                    return 0
                }
                if (util.isInstanceOf<ValueNotifyUserVideo>(notifyDetail, 'userName')) {
                    // 動画投稿者
                    userNameSpan.textContent = notifyDetail.userName
                    return 1
                }
            }
            return undefined
        }
    },
    Background: {
        createNotifyPostData(valuesNotify: ValuesNotify): NotifyPostData{
            if (util.isInstanceOf<ValuesNotifySeries>(valuesNotify.config.notifyDetail, 'seriesId')){
                return {
                    valueId: valuesNotify.config.valueId,
                    title: valuesNotify.config.notifyDetail.seriesName,
                    titleLink: 'https://www.nicovideo.jp/series/' + valuesNotify.config.notifyDetail.seriesId
                }
            }
            if (util.isInstanceOf<ValueNotifyUserVideo>(valuesNotify.config.notifyDetail, 'userId')){
                return {
                    valueId: valuesNotify.config.valueId,
                    title: valuesNotify.config.notifyDetail.userName,
                    titleLink: 'https://www.nicovideo.jp/user/' + valuesNotify.config.notifyDetail.userId
                }
            }
            return util.throwText('NotifyDetailが見つかりません')
        },
        async getCurrentWatchId(valuesNotify: ValuesNotify): Promise<string | undefined>{
            if (util.isInstanceOf<ValuesNotifySeries>(valuesNotify.config.notifyDetail, 'seriesId')) {
                if (valuesNotify.config.lastWatchId) {
                    return (await getCacheWatchDetail(valuesNotify.config.lastWatchId)).data.series.video.next?.id
                } else {
                    if (util.isInstanceOf<ValuesNotifySeries>(valuesNotify.config.notifyDetail, 'seriesId')) {
                        // 最初の動画
                        return (await NicoAPI.getSeries(valuesNotify.config.notifyDetail.seriesId)).data.items[0].video.id
                    }
                }
            }
            return util.throwText('NotifyDetailが見つかりません')
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
                return getCacheWatchDetail(seriesData.data.items[seriesData.data.items.length - 1].video.id, true)
            }
            return util.throwText('NotifyDetailが見つかりません')
        },
        getCacheWatchDetail
    }
}
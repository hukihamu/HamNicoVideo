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
import storage from '@/storage';

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
                    if (watchDetailType.data.channel) {
                        const channelId = watchDetailType.data.channel.id.replace('ch', '')
                        const channelVideos = await NicoAPI.getChannelVideos(channelId)
                        return {
                            userId: Number.parseInt(channelId),
                            userName: watchDetailType.data.channel.name,
                            lastCheckIndex: channelVideos.niconico_response.video_info.findIndex(v => v.video.id === watchDetailType.data.client.watchId),
                            isCh: true
                        }
                    }else if (watchDetailType.data.owner){
                        const userVideos = await NicoAPI.getUserVideos(watchDetailType.data.owner.id)
                        return {
                            userId: watchDetailType.data.owner.id,
                            isCh:false,
                            userName: watchDetailType.data.owner.nickname,
                            lastCheckIndex: userVideos.data.items.findIndex(v => v.essential.id === watchDetailType.data.client.watchId)
                        }
                    }
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
            if (util.isInstanceOf<ValueNotifyUserVideo>(valuesNotify.config.notifyDetail, 'userId')){
                // index取得を行う
                if (valuesNotify.config.notifyDetail.lastCheckIndex === -1){
                    let lastCheckIndex = -1
                    if (valuesNotify.config.notifyDetail.isCh){
                        let page = 0
                        let index = -1
                        let channelVideos = await NicoAPI.getChannelVideos(valuesNotify.config.notifyDetail.userId, page)
                        for(page; page < channelVideos.niconico_response.total_count; page+= 100){
                            index = channelVideos.niconico_response.video_info.findIndex(v => v.video.id === valuesNotify.config.lastWatchId)
                            if (index !== -1){
                                lastCheckIndex = page + index
                                break
                            }
                            channelVideos = await NicoAPI.getChannelVideos(valuesNotify.config.notifyDetail.userId, page)
                        }

                    } else {
                        let page = 1
                        let index = -1
                        let channelVideos = await NicoAPI.getUserVideos(valuesNotify.config.notifyDetail.userId, page)
                        for(page; page < channelVideos.data.totalCount; page++){
                            index = channelVideos.data.items.findIndex(v => v.essential.id === valuesNotify.config.lastWatchId)
                            if (index !== -1) {
                                lastCheckIndex = (page - 1) * 100 + index
                                break
                            }
                            channelVideos = await NicoAPI.getUserVideos(valuesNotify.config.notifyDetail.userId, page)
                        }
                    }
                    if (lastCheckIndex !== -1){
                        valuesNotify.config.notifyDetail.lastCheckIndex = lastCheckIndex
                    } else {
                        return util.throwText(`投稿者動画から、対象動画が見つかりませんでした。ID:${valuesNotify.config.lastWatchId}`)
                    }
                }
                // 1つ新しい動画IDを取得
                let index = -1
                let lastCheckIndex = -1
                let page = valuesNotify.config.notifyDetail.lastCheckIndex - 1
                if (page < 0) page = 0
                let watchId: string | undefined
                if (valuesNotify.config.notifyDetail.isCh){
                    let channelVideos = await NicoAPI.getChannelVideos(valuesNotify.config.notifyDetail.userId, page)
                    for(page; page < channelVideos.niconico_response.total_count; page+= 100){
                        index = channelVideos.niconico_response.video_info.findIndex(v => v.video.id === valuesNotify.config.lastWatchId)
                        if (index !== -1){
                            lastCheckIndex = page + index
                            if (index === 0) break
                            watchId = channelVideos.niconico_response.video_info[index - 1].video.id
                            break
                        }
                        channelVideos = await NicoAPI.getChannelVideos(valuesNotify.config.notifyDetail.userId, page)
                    }
                } else {
                    page = Math.floor(page/100) + 1
                    let channelVideos = await NicoAPI.getUserVideos(valuesNotify.config.notifyDetail.userId, page)
                    for(page; page < channelVideos.data.totalCount; page++){
                        index = channelVideos.data.items.findIndex(v => v.essential.id === valuesNotify.config.lastWatchId)
                        if (index !== -1){
                            lastCheckIndex = (page - 1) * 100 + index
                            if (index === 0) break
                            watchId = channelVideos.data.items[index - 1].essential.id
                            break
                        }
                        channelVideos = await NicoAPI.getUserVideos(valuesNotify.config.notifyDetail.userId, page)
                    }
                }
                if (index === -1) return util.throwText(`投稿者動画から、対象動画が見つかりませんでした。ID:${valuesNotify.config.lastWatchId}`)
                if (lastCheckIndex !== -1 && valuesNotify.config.notifyDetail.lastCheckIndex !== lastCheckIndex){
                    valuesNotify.config.notifyDetail.lastCheckIndex = lastCheckIndex
                    const param = storage.get('Notify_NotifyList')
                    const dvIndex = util.findIndex(valuesNotify.config.valueId, param.config.dynamicValues)
                    param.config.dynamicValues[dvIndex] = valuesNotify
                    storage.set('Notify_NotifyList', param)
                }
                if (index === 0) return
                return watchId
            }
            return util.throwText('NotifyDetailが見つかりません')
        },
        async getNextWatchId(valuesNotify: ValuesNotify, currentWatchId: string): Promise<string | undefined>{
            if (util.isInstanceOf<ValuesNotifySeries>(valuesNotify.config.notifyDetail, 'seriesId')) {
                return (await Notify.Background.getCacheWatchDetail(currentWatchId)).data.series.video.next?.id
            }
            if (util.isInstanceOf<ValueNotifyUserVideo>(valuesNotify.config.notifyDetail, 'userId')){
                // TODO 取得のみ
            }
            return util.throwText('NotifyDetailが見つかりません')
        },
        async getPrevWatchId(valuesNotify: ValuesNotify, currentId: string): Promise<string | undefined>{
            if (util.isInstanceOf<ValuesNotifySeries>(valuesNotify.config.notifyDetail, 'seriesId')) {
                return (await Notify.Background.getCacheWatchDetail(currentId)).data.series.video.prev?.id
            }
            if (util.isInstanceOf<ValueNotifyUserVideo>(valuesNotify.config.notifyDetail, 'userId')){
                // TODO 取得のみ
            }
            return util.throwText('NotifyDetailが見つかりません')
        },
        async getLastedWatchId(valuesNotify: ValuesNotify): Promise<WatchDetailType>{
            if (util.isInstanceOf<ValuesNotifySeries>(valuesNotify.config.notifyDetail, 'seriesId')) {
                const seriesData =  (await NicoAPI.getSeries(valuesNotify.config.notifyDetail.seriesId))
                return getCacheWatchDetail(seriesData.data.items[seriesData.data.items.length - 1].video.id, true)
            }
            if (util.isInstanceOf<ValueNotifyUserVideo>(valuesNotify.config.notifyDetail, 'userId')){
                // TODO 取得のみ
            }
            return util.throwText('NotifyDetailが見つかりません')
        },
        getCacheWatchDetail
    }
}
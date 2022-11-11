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
import {NotifySeries} from '@/notify/series';
import {NotifyUser} from '@/notify/user';

export type NotifyDetailType = 'series' | 'user_video'


const cacheWatchDetail: { [watchId: string]: WatchDetailType } = {}
const getCacheWatchDetail = async (watchId: string, isReload: boolean = false): Promise<WatchDetailType>=>{
    if (isReload || !cacheWatchDetail[watchId]) cacheWatchDetail[watchId] = await NicoAPI.getWatchDetail(watchId)
    return cacheWatchDetail[watchId]
}

const moveUserVideo = async (lastWatchId: string, notifyUserVideo: ValueNotifyUserVideo, moveIndex: number): Promise<string | undefined>=>{
    let lastCheckIndex = -1
    // moveIndex分動かす
    let page = notifyUserVideo.lastCheckIndex - moveIndex
    if (page < 0) page = 0
    let watchId: string | undefined
    if (notifyUserVideo.isCh){// チャンネルの場合
        let channelVideos = await NicoAPI.getChannelVideos(notifyUserVideo.userId, page)
        for(page; page < channelVideos.niconico_response.total_count; page+= 100){
            // lastWatchを探す
            let index = channelVideos.niconico_response.video_info.findIndex(v => v.video.id === lastWatchId)
            if (index !== -1){// 見つかった場合
                lastCheckIndex = page + index
                if (moveIndex > 0 && lastCheckIndex === 0) break // これ以上進めないため動画なしと判断
                if (moveIndex < 0 && lastCheckIndex >= channelVideos.niconico_response.total_count - 1) break // これ以上戻れないため動画なしと判断
                if (index - moveIndex < 0 || index - moveIndex >= channelVideos.niconico_response.video_info.length) {
                    // 該当データindexが0になるように取得
                    channelVideos = await NicoAPI.getChannelVideos(notifyUserVideo.userId, lastCheckIndex - moveIndex)
                    index = moveIndex // indexが0になるようにセット
                }
                watchId = channelVideos.niconico_response.video_info[index - moveIndex].video.id
                break
            }
            channelVideos = await NicoAPI.getChannelVideos(notifyUserVideo.userId, page)
        }
    } else { // userの場合
        page = Math.floor(page/100) + 1 //indexからpageに変換
        let userVideos = await NicoAPI.getUserVideos(notifyUserVideo.userId, page)
        for(page; page < userVideos.data.totalCount; page++){
            let index = userVideos.data.items.findIndex(v => v.essential.id === lastWatchId)
            if (index !== -1){// 見つかった場合
                lastCheckIndex = (page - 1) * 100 + index //pageからindexに変換
                if (moveIndex > 0 && lastCheckIndex === 0) break // これ以上進めないため動画なしと判断
                if (moveIndex < 0 && lastCheckIndex >= userVideos.data.totalCount - 1) break // これ以上戻れないため動画なしと判断
                if (index - moveIndex < 0) {
                    // 前のページから取得
                    userVideos = await NicoAPI.getUserVideos(notifyUserVideo.userId, page - 1)
                    index = 99 + index // 前のページに合わせる
                }
                if (index - moveIndex >= userVideos.data.items.length) {
                    // 次のページから取得
                    userVideos = await NicoAPI.getUserVideos(notifyUserVideo.userId, page + 1)
                    index = 0 + index // 前のページに合わせる
                    break
                }
                watchId = userVideos.data.items[index - moveIndex].essential.id
                break
            }
            userVideos = await NicoAPI.getUserVideos(notifyUserVideo.userId, page)
        }
    }
    return watchId
}
export interface NotifyInterface {
    EditNotify: {
        onChangeTargetType: (targetType: NotifyDetailType) => void
        createNotifyDetail: (targetType: NotifyDetailType, watchDetailType: WatchDetailType) => Promise<NotifyDetail | undefined>
        clearEditView: () => void
        initEditView: (notifyDetail: NotifyDetail) => number | undefined
    },
    Background: {
        createNotifyPostData: (valuesNotify: ValuesNotify) => NotifyPostData | undefined
        getCurrentWatchId: (valuesNotify: ValuesNotify)=> Promise<string | undefined>
        getNextWatchId: (valuesNotify: ValuesNotify, currentWatchId: string) => Promise<string | undefined>
        getPrevWatchId: (valuesNotify: ValuesNotify, currentId: string) => Promise<string | undefined>
        getLastedWatchId: (valuesNotify: ValuesNotify) => Promise<WatchDetailType | undefined>
    }
}
const notifyFuncList: NotifyInterface[] = [
    NotifySeries,NotifyUser
]
const allRunNotifyFunc = (func: (ni: NotifyInterface)=>void)=>{
    notifyFuncList.forEach(value =>func(value))
}
const resultRunNotifyFunc = (func: (ni: NotifyInterface)=>any): any=>{
    for (const n of notifyFuncList){
        const result = func(n)
        if (result !== undefined) return result
    }
    return undefined
}
export const Notify = {
    EditNotify: {
        onChangeTargetType: (targetType: NotifyDetailType) => {
            allRunNotifyFunc(ni => ni.EditNotify.onChangeTargetType(targetType))
            const tagsDiv = doc.getElementById('tags_value')
            tagsDiv.classList.toggle('hidden', true)
        },
        createNotifyDetail: async (targetType: NotifyDetailType, watchDetailType: WatchDetailType): Promise<NotifyDetail | undefined> => {
            return resultRunNotifyFunc(ni => ni.EditNotify.createNotifyDetail(targetType,watchDetailType))
        },
        initEditView: (notifyDetail: NotifyDetail | undefined): number | undefined => {
            allRunNotifyFunc(ni => ni.EditNotify.clearEditView())
            if (notifyDetail) {
                return resultRunNotifyFunc(ni => ni.EditNotify.initEditView(notifyDetail))
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
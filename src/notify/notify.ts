import util from '@/util';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {
    NotifyDetail,
    ValuesNotify,
    NotifyDetailSeries, NotifyDetailTag
} from '@/storage/parameters/values_type/values_notify';
import {NotifyPostData} from '@/post_data/notify_post_data';
import {SeriesBackgroundNotify, SeriesInputNotify} from '@/notify/series';
import {VideoDetailPostData} from '@/post_data/video_detail_post_data';
import {TagBackgroundNotify, TagInputNotify} from '@/notify/tag';


// const moveUserVideo = async (lastWatchId: string, notifyUserVideo: ValueNotifyUserVideo, moveIndex: number): Promise<string | undefined>=>{
//     let lastCheckIndex = -1
//     // moveIndex分動かす
//     let page = notifyUserVideo.lastCheckIndex - moveIndex
//     if (page < 0) page = 0
//     let watchId: string | undefined
//     if (notifyUserVideo.isCh){// チャンネルの場合
//         let channelVideos = await NicoAPI.getChannelVideos(notifyUserVideo.userId, page)
//         for(page; page < channelVideos.niconico_response.total_count; page+= 100){
//             // lastWatchを探す
//             let index = channelVideos.niconico_response.video_info.findIndex(v => v.video.id === lastWatchId)
//             if (index !== -1){// 見つかった場合
//                 lastCheckIndex = page + index
//                 if (moveIndex > 0 && lastCheckIndex === 0) break // これ以上進めないため動画なしと判断
//                 if (moveIndex < 0 && lastCheckIndex >= channelVideos.niconico_response.total_count - 1) break // これ以上戻れないため動画なしと判断
//                 if (index - moveIndex < 0 || index - moveIndex >= channelVideos.niconico_response.video_info.length) {
//                     // 該当データindexが0になるように取得
//                     channelVideos = await NicoAPI.getChannelVideos(notifyUserVideo.userId, lastCheckIndex - moveIndex)
//                     index = moveIndex // indexが0になるようにセット
//                 }
//                 watchId = channelVideos.niconico_response.video_info[index - moveIndex].video.id
//                 break
//             }
//             channelVideos = await NicoAPI.getChannelVideos(notifyUserVideo.userId, page)
//         }
//     } else { // userの場合
//         page = Math.floor(page/100) + 1 //indexからpageに変換
//         let userVideos = await NicoAPI.getUserVideos(notifyUserVideo.userId, page)
//         for(page; page < userVideos.data.totalCount; page++){
//             let index = userVideos.data.items.findIndex(v => v.essential.id === lastWatchId)
//             if (index !== -1){// 見つかった場合
//                 lastCheckIndex = (page - 1) * 100 + index //pageからindexに変換
//                 if (moveIndex > 0 && lastCheckIndex === 0) break // これ以上進めないため動画なしと判断
//                 if (moveIndex < 0 && lastCheckIndex >= userVideos.data.totalCount - 1) break // これ以上戻れないため動画なしと判断
//                 if (index - moveIndex < 0) {
//                     // 前のページから取得
//                     userVideos = await NicoAPI.getUserVideos(notifyUserVideo.userId, page - 1)
//                     index = 99 + index // 前のページに合わせる
//                 }
//                 if (index - moveIndex >= userVideos.data.items.length) {
//                     // 次のページから取得
//                     userVideos = await NicoAPI.getUserVideos(notifyUserVideo.userId, page + 1)
//                     index = 0 + index // 前のページに合わせる
//                     break
//                 }
//                 watchId = userVideos.data.items[index - moveIndex].essential.id
//                 break
//             }
//             userVideos = await NicoAPI.getUserVideos(notifyUserVideo.userId, page)
//         }
//     }
//     return watchId
// }
export const Notify = {
    getInputNotify: (notifyType: NotifyType):InputNotify =>{
        switch (notifyType) {
            case 'series':
                return new SeriesInputNotify()
            case 'tag':
                return new TagInputNotify()
        }
    },
    getBackgroundNotify: (notify: ValuesNotify, cache: CachePostData): BackgroundNotify =>{
        switch (Notify.checkNotifyType(notify)) {
            case 'series':
                return new SeriesBackgroundNotify(notify, cache)
            case 'tag':
                return new TagBackgroundNotify(notify, cache)
        }
    },
    checkNotifyType: (notify: ValuesNotify): NotifyType =>{
        if (util.isInstanceOf<NotifyDetailSeries>(notify.config.notifyDetail, 'seriesId')){
            return 'series'
        }
        if (util.isInstanceOf<NotifyDetailTag>(notify.config.notifyDetail, 'searchTagText')){
            return 'tag'
        }
        return util.throwText('想定されていない通知データが含まれる')
    }
}
export const NotifyTypeArray = [
    {key: 'series',name: 'シリーズ'},
    {key: 'tag',name: 'タグ'}
] as const
export type NotifyType = typeof NotifyTypeArray[number]['key']

export interface InputNotify {
    /**
     * APIから取得したデータから、NotifyDetailを生成
     */
    createNotifyDetail(watchDetail: WatchDetailType): NotifyDetail

    /**
     * NotifyDetailの項目をすべてinput化 required、Util.setReadonlyの設定も行う
     */
    createNotifyDetailElement(): HTMLDivElement

    /**
     * APIから取得したデータをすべてのinputにset
     * @param watchDetail
     */
    showWatchDetail(watchDetail: WatchDetailType): void

    /**
     * NotifyDetailのデータをすべてのinputにset
     * @param notifyDetail
     */
    showNotifyDetail(notifyDetail: NotifyDetail): void

    /**
     * すべてのinputデータをNotifyDetailにset
     * @param notifyDetail
     */
    setNotifyDetail(notifyDetail: NotifyDetail): void
}
export interface CachePostData {
    [valueId: number]: (VideoDetailPostData | undefined)[]
}

export interface BackgroundNotify {
    /**
     * 更新ボタンを押した際に情報をメモリに格納する
     */
    setCache(): Promise<void>

    /**
     * `this.valuesNotify.config.lastWatchId`の次の動画を渡す<br>
     * なければundefined
     */
    currentVideoDetailPostData(): Promise<VideoDetailPostData | undefined>

    /**
     * 1番最初の動画を渡す<br>
     * なければundefined
     */
    firstVideoDetailPostData(): Promise<VideoDetailPostData | undefined>

    /**
     * 次の動画があった場合、 `this.valuesNotify.config.lastWatchId`に値をセットする
     */
    nextWatchId(): Promise<void>

    /**
     * 前の動画があった場合、 `this.valuesNotify.config.lastWatchId`に値をセットする
     */
    prevWatchId(): Promise<void>

    /**
     *　cacheから確認日より後の動画を探す
     */
    isNewVideo(): Promise<boolean>

    /**
     * NotifyPostData(最初にpopupに渡すデータ)を作成する
     */
    createNotifyPostData(): NotifyPostData
}
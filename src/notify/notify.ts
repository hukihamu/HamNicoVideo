import {doc} from '@/window';
import util from '@/util';
import {WatchDetailType} from '@/nico_client/watch_detail';
import {NicoAPI} from '@/nico_client/nico_api';

export type ValuesNotifyType = {
  series: ValuesNotifySeriesType
  user_video: ValueNotifyUserVideoType
}

export const Notify = {
  EditNotify: {
    onChangeTargetType: (targetType: keyof ValuesNotifyType)=>{
      const seriesDiv = doc.getElementById('series_value')
      const userVideoDiv = doc.getElementById('user_video_value')
      const tagsDiv = doc.getElementById('tags_value')
      seriesDiv.classList.toggle('hidden', targetType !== 'series')
      userVideoDiv.classList.toggle('hidden', targetType !== 'user_video')
      tagsDiv.classList.toggle('hidden', true)
    },
    checkAdditionalValuesNotify: (targetType: keyof ValuesNotifyType, additionalValuesNotify: ValuesNotifyType[keyof ValuesNotifyType]): boolean=>{
      return util.isInstanceOf<ValuesNotifySeries>(additionalValuesNotify, 'seriesId')
        || util.isInstanceOf<ValueNotifyUserVideoType>(additionalValuesNotify, 'userId')
    },
    createAdditionalValuesNotify: async (targetType: keyof ValuesNotifyType, watchDetailType: WatchDetailType): Promise<ValuesNotifyType[keyof ValuesNotifyType] | undefined> => {
      switch (targetType) {
        case 'series': {
          if (watchDetailType.data.series) {
            return {
              seriesId: watchDetailType.data.series.id.toString(),
              seriesName: watchDetailType.data.series.title
            }
          } else {
            alert('シリーズを取得できませんでした')
          }
          break
        }
        case 'user_video':{
          // TODO
          if (watchDetailType.data.channel){
            console.warn(await NicoAPI.getChannel(watchDetailType.data.channel.id.replace('ch','')))
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
    // TODO as地獄を解消したい
    initEditView: (additionalValuesNotify: ValuesNotifyType[keyof ValuesNotifyType] | undefined): number | undefined=>{
      const seriesNameSpan = doc.getElementById('series_name')
      const userNameSpan = doc.getElementById('user_name')
      seriesNameSpan.textContent = ''
      userNameSpan.textContent = ''
      if (additionalValuesNotify){
        if (util.isInstanceOf<ValuesNotifySeriesType>(additionalValuesNotify, 'seriesName')) {
          // シリーズ
          seriesNameSpan.textContent = additionalValuesNotify.seriesName
          return 0
        }
        if (util.isInstanceOf<ValueNotifyUserVideoType>(additionalValuesNotify, 'userName')) {
          // 動画投稿者
          userNameSpan.textContent = additionalValuesNotify.userName
          return 1
        }
      }
      return undefined
    }
  }
}

// 0.6のConfigから引き継ぐ
import storage from '@/storage'
import {BROWSER} from '@/browser'
import {parameterDefault} from '@/storage/parameters/index'
import {nicoRepoMatcher} from '@/storage/parameters/nico_repo_matcher'
import {NotifyDetailSeries, NotifyDetailTag, ValuesNotify} from '@/storage/parameters/values_type/values_notify'

const takeoverOldParameter = async () => {
  // TODO jsonインポートのみにするのか、storageを汲み取るのか
  if (await getOldParameter<string>('video/repo/highlight/ad')){
    await Promise.all([
      getOldParameter<boolean>('video/repo/add_watch_later').then((it) => {
        // ニコレポに後で見るボタン追加
        storage.set('Video_MyPage_AddWatchLater', {config: {enable: it}})
      }),
      getOldParameter<boolean>('video/watch/remove_watch_later').then((it) => {
        // 視聴動画の後で見る削除ボタン追加
        storage.set('Video_Watch_RemoveWatchLater', {config: {enable: it}})
      }),
      Promise.all([
        // カスタムマイリストを有効化
        getOldParameter<boolean>('video/watch/custom_my_list/enable'),
        // カスタムマイリストのマイリストID
        getOldParameter<string>('video/watch/custom_my_list/id')
      ]).then(([enable, textValue]) => {
        storage.set('Video_Watch_OneClickMyList', {config: {enable, textValue }})
      }),
      Promise.all([
        getOldParameter<boolean>('video/repo/side_fold/types'),
        getOldParameter<boolean>('video/repo/side_fold/target'),
        getOldParameter<boolean>('video/repo/side_fold/filter'),
      ]).then(([isTypes, isTarget, isFilter]) => {
        storage.set('Video_MyPage_HideSideBar', {
          config: {
            enable: true,
            templateVersion: 1,
            values: [
              {valueId: 'TYPE', enable: isTypes},
              {valueId: 'FILTER', enable: isTarget},
              {valueId: 'HIDDEN_FILTER', enable: isFilter}
            ]
          },
          template: parameterDefault.Video_MyPage_HideSideBar.template
        })
      }),
      Promise.all([
        getOldParameter<boolean>('video/repo/filter/ad'),
        getOldParameter<boolean>('video/repo/filter/blog'),
        getOldParameter<boolean>('video/repo/filter/enable'),
        getOldParameter<boolean>('video/repo/filter/follow'),
        getOldParameter<boolean>('video/repo/filter/image'),
        getOldParameter<boolean>('video/repo/filter/image_clip'),
        getOldParameter<boolean>('video/repo/filter/kiri'),
        getOldParameter<boolean>('video/repo/filter/like'),
        getOldParameter<boolean>('video/repo/filter/live'),
        getOldParameter<boolean>('video/repo/filter/live_plan'),
        getOldParameter<boolean>('video/repo/filter/manga'),
        getOldParameter<boolean>('video/repo/filter/model'),
        getOldParameter<boolean>('video/repo/filter/my_list'),
        getOldParameter<boolean>('video/repo/filter/video'),
        getOldParameter<boolean>('video/repo/filter/video_live'),
        getOldParameter<boolean>('video/repo/filter/video_live_plan'),
      ]).then(([ad, blog, enable, follow, image, imageClip, kiri, like, live, livePlan, manga, model, myList, video, videoLive, videoLivePlan]) => {
        storage.set('Video_MyPage_HiddenFilter', {
          config: {
            enable: enable,
            templateVersion: 1,
            values: [
              {enable: video, valueId: nicoRepoMatcher.VIDEO_UP.valueId},
              {enable: videoLive, valueId: nicoRepoMatcher.VIDEO_LIVE.valueId},
              {enable: videoLivePlan, valueId: nicoRepoMatcher.VIDEO_LIVE_PLAN.valueId},
              {enable: kiri, valueId: nicoRepoMatcher.KIRI.valueId},
              {enable: myList, valueId: nicoRepoMatcher.MY_LIST.valueId},
              {enable: like, valueId: nicoRepoMatcher.LIKE.valueId},
              {enable: ad, valueId: nicoRepoMatcher.AD.valueId},
              {enable: live, valueId: nicoRepoMatcher.LIVE_START.valueId},
              {enable: livePlan, valueId: nicoRepoMatcher.LIVE_PLAN.valueId},
              {enable: image, valueId: nicoRepoMatcher.IMAGE_UP.valueId},
              {enable: imageClip, valueId: nicoRepoMatcher.IMAGE_CLIP.valueId},
              {enable: blog, valueId: nicoRepoMatcher.BLOG_UP.valueId},
              {enable: manga, valueId: nicoRepoMatcher.MANGA_UP.valueId},
              {enable: false, valueId: nicoRepoMatcher.MANGA_FAV.valueId},
              {enable: model, valueId: nicoRepoMatcher.MODEL_UP.valueId},
              {enable: false, valueId: nicoRepoMatcher.MODEL_FAV.valueId},
              {enable: follow, valueId: nicoRepoMatcher.FOLLOW.valueId},
            ]
          },
          template: parameterDefault.Video_MyPage_HiddenFilter.template
        })
      }),
      getOldParameter<string>('video/notification/list').then((it) => {
        const json = JSON.parse(it)
        const oldList: ValuesNotify[] = []
        for (const j of json) {
          oldList.push({
            config: {
              valueId: Date.now(),
              groupTag: undefined,
              intervalTime: j.intervalTime,
              intervalWeek: j.intervalWeek,
              isInterval: j.isInterval,
              lastCheckDateTime: j.lastCheck,
              lastWatchId: j.lastVideoId,
              notifyDetail: j.flag === 'series' ? {
                seriesId: j.notifyData,
                isReverse: false,
                seriesName: j.dataName,
              } as NotifyDetailSeries: {
                lastCheckPage: 1,
                searchTagText: j.notifyData,
              } as NotifyDetailTag,
            }
          })
        }

        storage.set('Notify_NotifyList', {
          config: {
            enable: true,
            dynamicValues: oldList
          }
        })
      }),
      Promise.all([
        getOldParameter<string>('video/repo/highlight/ad'),
        getOldParameter<string>('video/repo/highlight/blog'),
        getOldParameter<boolean>('video/repo/highlight/enable'),
        getOldParameter<string>('video/repo/highlight/follow'),
        getOldParameter<string>('video/repo/highlight/image'),
        getOldParameter<string>('video/repo/highlight/image_clip'),
        getOldParameter<string>('video/repo/highlight/kiri'),
        getOldParameter<string>('video/repo/highlight/like'),
        getOldParameter<string>('video/repo/highlight/live'),
        getOldParameter<string>('video/repo/highlight/live_plan'),
        getOldParameter<string>('video/repo/highlight/manga'),
        getOldParameter<string>('video/repo/highlight/model'),
        getOldParameter<string>('video/repo/highlight/my_list'),
        getOldParameter<string>('video/repo/highlight/video'),
        getOldParameter<string>('video/repo/highlight/video_live'),
        getOldParameter<string>('video/repo/highlight/video_live_plan'),
      ]).then(([ad, blog, enable, follow, image, imageClip, kiri, like, live, livePlan, manga, model, myList, video, videoLive, videoLivePlan]) => {
        storage.set('Video_MyPage_Highlight', {
          config: {
            enable: enable,
            templateVersion: 1,
            values: [
              {enable: video !== '#FFFFFFFF', color: video, valueId: nicoRepoMatcher.VIDEO_UP.valueId},
              {enable: videoLive !== '#FFFFFFFF', color: videoLive, valueId: nicoRepoMatcher.VIDEO_LIVE.valueId},
              {enable: videoLivePlan !== '#FFFFFFFF', color: videoLivePlan, valueId: nicoRepoMatcher.VIDEO_LIVE_PLAN.valueId},
              {enable: kiri !== '#FFFFFFFF', color: kiri, valueId: nicoRepoMatcher.KIRI.valueId},
              {enable: myList !== '#FFFFFFFF', color: myList, valueId: nicoRepoMatcher.MY_LIST.valueId},
              {enable: like !== '#FFFFFFFF', color: like, valueId: nicoRepoMatcher.LIKE.valueId},
              {enable: ad !== '#FFFFFFFF', color: ad, valueId: nicoRepoMatcher.AD.valueId},
              {enable: live !== '#FFFFFFFF', color: live, valueId: nicoRepoMatcher.LIVE_START.valueId},
              {enable: livePlan !== '#FFFFFFFF', color: livePlan, valueId: nicoRepoMatcher.LIVE_PLAN.valueId},
              {enable: image !== '#FFFFFFFF', color: image, valueId: nicoRepoMatcher.IMAGE_UP.valueId},
              {enable: imageClip !== '#FFFFFFFF', color: imageClip, valueId: nicoRepoMatcher.IMAGE_CLIP.valueId},
              {enable: blog !== '#FFFFFFFF', color: blog, valueId: nicoRepoMatcher.BLOG_UP.valueId},
              {enable: manga !== '#FFFFFFFF', color: manga, valueId: nicoRepoMatcher.MANGA_UP.valueId},
              {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.MANGA_FAV.valueId},
              {enable: model !== '#FFFFFFFF', color: model, valueId: nicoRepoMatcher.MODEL_UP.valueId},
              {enable: false, color: '#FFFFFFFF', valueId: nicoRepoMatcher.MODEL_FAV.valueId},
              {enable: follow !== '#FFFFFFFF', color: follow, valueId: nicoRepoMatcher.FOLLOW.valueId},
            ]
          },
          template: parameterDefault.Video_MyPage_Highlight.template
        })
      }),
      getOldParameter<number>('video/repo/created_at_new_color').then((it) => {
        storage.set('Video_MyPage_HighlightNewRange', {
          config: {
            enable: Number.isInteger(it),
            templateVersion: 1,
            selectIndex: it,
          }, template: parameterDefault.Video_MyPage_HighlightNewRange.template})
      }),
      getOldParameter<boolean>('video/repo/custom_layout').then((it) => {
        storage.set('Video_MyPage_SlimItem', {config: {enable: it}})
      }),
      getOldParameter<string>('video/watch/minimum_like').then((it) => {
        storage.set('Video_Watch_MinimizeLike', {
          config: {
            enable: Number.isInteger(it),
            templateVersion: 1,
            selectIndex: Number.parseInt(it)
          },
          template: parameterDefault.Video_Watch_MinimizeLike.template
        })
      }),
    ]).then()
  }
}

const getOldParameter = <T>(key: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    BROWSER.storage.local.get(key).then(it => {
      if (it[key]) {
        BROWSER.storage.local.remove(key).then()
        resolve(it[key])
      } else {
        reject()
      }
    })
  })
}
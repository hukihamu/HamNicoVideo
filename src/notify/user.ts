import {NotifyDetailType, NotifyInterface} from '@/notify/notify';
import {doc} from '@/window';
import {NicoAPI} from '@/nico_client/nico_api';
import util from '@/util';
import {ValueNotifyUserVideo} from '@/storage/parameters/values_type/values_notify';

export const NotifyUser: NotifyInterface = {
    EditNotify: {
        onChangeTargetType: (targetType: NotifyDetailType) => {
            const userVideoDiv = doc.getElementById('user_video_value')
            userVideoDiv.classList.toggle('hidden', targetType !== 'user_video')
        },
        initEditView: (notifyDetail) => {
            const userNameSpan = doc.getElementById('user_name')
            if (util.isInstanceOf<ValueNotifyUserVideo>(notifyDetail, 'userName')) {
                // 動画投稿者
                userNameSpan.textContent = notifyDetail.userName
                return 1
            }
            return undefined
        },
        clearEditView: () => {
            const userNameSpan = doc.getElementById('user_name')
            userNameSpan.textContent = ''
        },
        createNotifyDetail: async (targetType, watchDetailType) => {
            if (targetType === 'user_video'){
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
                alert('投稿者を取得できませんでした')
            }
            return undefined
        }
    },
    Background: {
        createNotifyPostData: valuesNotify => {
            return util.throwText('NotifyDetailが見つかりません')
        },
        getCurrentWatchId: async valuesNotify => undefined,
        getLastedWatchId: async valuesNotify => {
            return util.throwText('NotifyDetailが見つかりません')
        },
        getNextWatchId: async valuesNotify => undefined,
        getPrevWatchId: async (valuesNotify, currentId) => undefined,
    }
}
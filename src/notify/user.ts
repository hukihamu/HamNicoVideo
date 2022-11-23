// export const NotifyUser: NotifyInterface = {
//     EditNotify: {
//         onChangeTargetType: (targetType: NotifyDetailType) => {
//             const userVideoDiv = doc.getElementById('user_video_value')
//             userVideoDiv.classList.toggle('hidden', targetType !== 'user_video')
//         },
//         initEditView: (notifyDetail) => {
//             const userNameSpan = doc.getElementById('user_name')
//             if (util.isInstanceOf<ValueNotifyUserVideo>(notifyDetail, 'userName')) {
//                 // 動画投稿者
//                 userNameSpan.textContent = notifyDetail.userName
//                 return 1
//             }
//             return undefined
//         },
//         clearEditView: () => {
//             const userNameSpan = doc.getElementById('user_name')
//             userNameSpan.textContent = ''
//         },
//         createNotifyDetail: async (targetType, watchDetailType) => {
//             if (targetType === 'user_video'){
//                 if (watchDetailType.data.channel) {
//                     const channelId = watchDetailType.data.channel.id.replace('ch', '')
//                     const channelVideos = await NicoAPI.getChannelVideos(channelId)
//                     return {
//                         userId: Number.parseInt(channelId),
//                         userName: watchDetailType.data.channel.name,
//                         lastCheckIndex: channelVideos.niconico_response.video_info.findIndex(v => v.video.id === watchDetailType.data.client.watchId),
//                         isCh: true
//                     }
//                 }else if (watchDetailType.data.owner){
//                     const userVideos = await NicoAPI.getUserVideos(watchDetailType.data.owner.id)
//                     return {
//                         userId: watchDetailType.data.owner.id,
//                         isCh:false,
//                         userName: watchDetailType.data.owner.nickname,
//                         lastCheckIndex: userVideos.data.items.findIndex(v => v.essential.id === watchDetailType.data.client.watchId)
//                     }
//                 }
//                 alert('投稿者を取得できませんでした')
//             }
//             return undefined
//         }
//     },
    // Background: {
        // createNotifyPostData: valuesNotify => {
        //     return {
        //         valueId: valuesNotify.config.valueId,
        //         title: valuesNotify.config.notifyDetail.userName,
        //         titleLink: 'https://www.nicovideo.jp/user/' + valuesNotify.config.notifyDetail.userId
        //     }
        // },
        // getCurrentWatchId: async valuesNotify => {
            // getCurrentWatchId
            // if (util.isInstanceOf<ValueNotifyUserVideo>(valuesNotify.config.notifyDetail, 'userId')){
            //     // index取得を行う
            //     if (valuesNotify.config.notifyDetail.lastCheckIndex === -1){
            //         let lastCheckIndex = -1
            //         if (valuesNotify.config.notifyDetail.isCh){
            //             let page = 0
            //             let index = -1
            //             let channelVideos = await NicoAPI.getChannelVideos(valuesNotify.config.notifyDetail.userId, page)
            //             for(page; page < channelVideos.niconico_response.total_count; page+= 100){
            //                 index = channelVideos.niconico_response.video_info.findIndex(v => v.video.id === valuesNotify.config.lastWatchId)
            //                 if (index !== -1){
            //                     lastCheckIndex = page + index
            //                     break
            //                 }
            //                 channelVideos = await NicoAPI.getChannelVideos(valuesNotify.config.notifyDetail.userId, page)
            //             }
            //
            //         } else {
            //             let page = 1
            //             let index = -1
            //             let channelVideos = await NicoAPI.getUserVideos(valuesNotify.config.notifyDetail.userId, page)
            //             for(page; page < channelVideos.data.totalCount; page++){
            //                 index = channelVideos.data.items.findIndex(v => v.essential.id === valuesNotify.config.lastWatchId)
            //                 if (index !== -1) {
            //                     lastCheckIndex = (page - 1) * 100 + index
            //                     break
            //                 }
            //                 channelVideos = await NicoAPI.getUserVideos(valuesNotify.config.notifyDetail.userId, page)
            //             }
            //         }
            //         if (lastCheckIndex !== -1){
            //             valuesNotify.config.notifyDetail.lastCheckIndex = lastCheckIndex
            //         } else {
            //             return util.throwText(`投稿者動画から、対象動画が見つかりませんでした。ID:${valuesNotify.config.lastWatchId}`)
            //         }
            //     }
            //     // 1つ新しい動画IDを取得
            //     let index = -1
            //     let lastCheckIndex = -1
            //     let page = valuesNotify.config.notifyDetail.lastCheckIndex - 1
            //     if (page < 0) page = 0
            //     let watchId: string | undefined
            //     if (valuesNotify.config.notifyDetail.isCh){
            //         let channelVideos = await NicoAPI.getChannelVideos(valuesNotify.config.notifyDetail.userId, page)
            //         for(page; page < channelVideos.niconico_response.total_count; page+= 100){
            //             index = channelVideos.niconico_response.video_info.findIndex(v => v.video.id === valuesNotify.config.lastWatchId)
            //             if (index !== -1){
            //                 lastCheckIndex = page + index
            //                 if (index === 0) break
            //                 watchId = channelVideos.niconico_response.video_info[index - 1].video.id
            //                 break
            //             }
            //             channelVideos = await NicoAPI.getChannelVideos(valuesNotify.config.notifyDetail.userId, page)
            //         }
            //     } else {
            //         page = Math.floor(page/100) + 1
            //         let channelVideos = await NicoAPI.getUserVideos(valuesNotify.config.notifyDetail.userId, page)
            //         for(page; page < channelVideos.data.totalCount; page++){
            //             index = channelVideos.data.items.findIndex(v => v.essential.id === valuesNotify.config.lastWatchId)
            //             if (index !== -1){
            //                 lastCheckIndex = (page - 1) * 100 + index
            //                 if (index === 0) break
            //                 watchId = channelVideos.data.items[index - 1].essential.id
            //                 break
            //             }
            //             channelVideos = await NicoAPI.getUserVideos(valuesNotify.config.notifyDetail.userId, page)
            //         }
            //     }
            //     if (index === -1) return util.throwText(`投稿者動画から、対象動画が見つかりませんでした。ID:${valuesNotify.config.lastWatchId}`)
            //     if (lastCheckIndex !== -1 && valuesNotify.config.notifyDetail.lastCheckIndex !== lastCheckIndex){
            //         valuesNotify.config.notifyDetail.lastCheckIndex = lastCheckIndex
            //         const param = storage.get('Notify_NotifyList')
            //         const dvIndex = util.findIndex(valuesNotify.config.valueId, param.config.dynamicValues)
            //         param.config.dynamicValues[dvIndex] = valuesNotify
            //         storage.set('Notify_NotifyList', param)
            //     }
            //     if (index === 0) return
            //     return watchId
            // }
        //     return undefined
        // },
    // }
// }
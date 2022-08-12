// TODO プレイヤー設定や、サイドパネルの表示を切り替える(動画前にコメント表示など)


// const nicoStorage = {
//     setPlaybackRate() {
//         const holdValue = PARAMETER.VIDEO.WATCH.HOLD_SETTING.PLAYBACK_RATE.HOLD_VALUE
//         if (localStorage.getItem('Player.playbackRate') !== holdValue.options[holdValue.pValue].value){
//             const optButton = document.getElementsByClassName('ActionButton PlaybackRateButton')[0]
//             optButton.click()
//
//             document.getElementsByClassName('PlaybackRateMenuItem')[7 - Number.parseInt(holdValue.pValue)]
//                 .click()
//             optButton.click()
//         }
//     },
//     setContinuous() {
//         if (localStorage.getItem('Player.isContinuous') !== PARAMETER.VIDEO.WATCH.HOLD_SETTING.CONTINUOUS.HOLD_VALUE.pValue.toString()){
//             const f = (c)=>{
//                 const holdValue = PARAMETER.VIDEO.WATCH.HOLD_SETTING.CONTINUOUS.HOLD_VALUE.pValue.toString().toLowerCase() === 'true'
//                 const parent = c.parentElement
//                 if (parent.classList.contains('is-checked') !== holdValue){
//                     parent.lastChild.click()
//                 }
//             }
//             const getLabel = ()=>{
//                 let l =document.getElementsByClassName('PlaylistControl-continuousLabel')[0]
//                 if (!l) l = document.getElementsByClassName('NextPlayVideoContainer-continuousLabel')[0]
//                 return l
//             }
//             const c1 = getLabel()
//             if (c1){
//                 f(c1)
//             }else {
//                 const tab = document.getElementsByClassName('PlayerPanelContainer-tabItem')
//                 tab[1].click()
//                 const c2 = getLabel()
//                 f(c2)
//                 tab[0].click()
//             }
//         }
//     },
//     set isRepeating(value) {
//         localStorage.setItem('Player.isRepeating', value)
//     }
// }
//
// const page = []
// const next = []
// const all = []
// let nextVideo = []
// let isFirst = true
//
// function holdSetting() {
//     //0 holdしない
//     //1 ページがかわれば
//     //2 連続再生中いがい = 連続再生時、「次の動画」以外に飛んだとき
//     //3 動画が変われば修正
//     const holdSettings = PARAMETER.VIDEO.WATCH.HOLD_SETTING
//
//
//     function setSetting(setting, f) {
//         switch (Number.parseInt(setting['ENABLE'].pValue)) {
//             case 1: {
//                 page.push(f)
//                 break
//             }
//             case 2: {
//                 next.push(f)
//                 break
//             }
//             case 3: {
//                 all.push(f)
//                 break
//             }
//         }
//     }
//
//     setSetting(holdSettings.CONTINUOUS, nicoStorage.setContinuous)
//     setSetting(holdSettings.PLAYBACK_RATE, nicoStorage.setPlaybackRate)
//
//     const contInterval = setInterval(() => {
//         const cont = document.getElementsByClassName('ControllerContainer-area ControllerContainer-centerArea')[0]
//         if (cont) {
//             clearInterval(contInterval)
//             new MutationObserver((mutationsList, observer) => {
//                 for (const mutations of mutationsList) {
//                     const addedNode = mutations.addedNodes[0]
//                     const removedNode = mutations.removedNodes[0]
//                     const target = mutations.target
//
//                     if (target && target.className === 'VideoBalloon-thumbnail'){
//                         const image = target.getAttribute('style')
//                         nextVideo.shift()
//                         nextVideo.push(image.match('/[0-9]+/')[0].replaceAll('/', ''))
//                     }else if (removedNode && removedNode.className === 'VideoBalloon'){
//                         nextVideo.shift()
//                         nextVideo.push(null)
//                     }else if (addedNode && addedNode.className === 'VideoBalloon'){
//                         const image = addedNode.getElementsByClassName('VideoBalloon-thumbnail')[0].getAttribute('style')
//                         nextVideo.shift()
//                         nextVideo.push(image.match('/[0-9]+/')[0].replaceAll('/', ''))
//                     }
//                 }
//             }).observe(cont, {
//                 subtree: true,
//                 childList: true,
//                 attributes: true,
//                 attributeFilter: ['style']
//             })
//         }
//     }, 100)
// }
//
// function onHold() {
//     if (isFirst){
//         isFirst = false
//         const thumbnail = document.getElementsByClassName('VideoBalloon-thumbnail')[0]
//         if (thumbnail){
//             const image = thumbnail.getAttribute('style')
//             nextVideo.push(image.match('/[0-9]+/')[0].replaceAll('/', ''))
//         }else {
//             nextVideo.push(null)
//         }
//         for (const f of page) {
//             f()
//         }
//     }
//     if (!nextVideo[0] || !location.pathname.replace('/watch/','').match(nextVideo[0])) {
//         for (const f of next) {
//             f()
//         }
//     }
//     for (const f of all) {
//         f()
//     }
// }
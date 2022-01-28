const onCreateAlarm = (child) => {
    if (!child.isInterval) return
    browserInstance.alarms.clear(child.notifyId)
    const dayOfWeekList = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

    const nowDate = new Date()
    const nowDayOfWeek = nowDate.getDay()
    const nowHour = `${nowDate.getHours().toString().padStart(2, '0')}:${nowDate.getMinutes().toString().padStart(2, '0')}`
    let dayOfWeek = nowDayOfWeek
    let counter
    for (counter = 0; counter < 7; counter++) {
        if (child.intervalWeek.indexOf(dayOfWeekList[dayOfWeek]) !== -1) {
            if (dayOfWeek === nowDayOfWeek) {
                if (nowHour === child.intervalTime) {
                    //確認処理
                    return
                } else if (nowHour < child.intervalTime) {
                    break
                }
            } else {
                break
            }
        }
        dayOfWeek++
        if (dayOfWeek >= 7) {
            dayOfWeek = 0
        }
    }
    const nextDay = new Date()
    nextDay.setDate(nextDay.getDate() + counter)
    nextDay.setHours(child.intervalTime.substring(0, 2), child.intervalTime.substring(3, 5), 0, 0)
    browserInstance.alarms.create(child.notifyId, {
        when: nextDay.getTime()
    })
}

let children = []
let videoHashMap = {}
const isInitVideoHashMap = []
const getChild = (id) => children.find((value) => value.notifyId === id)
const setChild = (child) => {
    const index = children.findIndex((value => value.notifyId === child.notifyId))
    NotificationDynamicChild.set(child.notifyId, () => {
        return child
    })
    children[index] = child
}
const addChild = (child) => {
    NotificationDynamicChild.add(child)
    children.push(child)
    isInitVideoHashMap.push(true)
}
const removeChild = (id) => {
    NotificationDynamicChild.remove(id)
    children = children.filter((value => value.notifyId !== id))
    browserInstance.alarms.clear(id)
    isInitVideoHashMap.pop()
}

const findVideoData = async (child, type) => {
    const list = videoHashMap[child.notifyId]
    const nextDirection = child.flag === 'series' ? 1 : -1
    const isError = () => new Promise((resolve) => {
        const xhr = new XMLHttpRequest()
        const url = new URL('https://ext.nicovideo.jp/api/getthumbinfo/' + child.lastVideoId.replace(':back', ''))
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                resolve(xhr.responseXML.getElementsByTagName('error')[0] !== undefined)
            }
        }
        xhr.open('GET', url)
        xhr.send()
    })
    const getLastIndex = () => {
        return list.findIndex(value => value.videoId === child.lastVideoId)
    }
    const result = {
        videoData: null,
        lastVideoId: null
    }
    switch (type) {
        case 'now': {
            if (!child.lastVideoId || await isError()) {
                result.videoData = list[0]
                break
            }
            if (child.lastVideoId.match(':back')) {
                result.videoData = list[list.length - 1]
                result.lastVideoId = child.lastVideoId
                break
            }
            const index = getLastIndex() + nextDirection
            result.videoData = 0 <= index && index < list.length ? list[index] : null
            break
        }
        case 'next': {
            if (child.lastVideoId && await isError()) {
                result.videoData = list[0]
                result.lastVideoId = null
                break
            }
            if (child.lastVideoId && child.lastVideoId.match(':back')) {
                result.videoData = list[list.length - 2]
                result.lastVideoId = child.lastVideoId.replace(':back', '')
                break
            }
            const index = child.lastVideoId ? getLastIndex() + 2 * nextDirection : nextDirection
            result.videoData = 0 <= index && index < list.length ? list[index] : null
            const lastIndex = index - 1 * nextDirection

            result.lastVideoId = 0 <= lastIndex && lastIndex < list.length
                ? list[lastIndex].videoId
                : list[lastIndex - 1 * nextDirection]
                    ? list[lastIndex - 1 * nextDirection].videoId
                    : null

            break
        }
        case 'prev': {
            if (!child.lastVideoId && nextDirection === -1) {
                result.videoData = list[1]
                result.lastVideoId = list[2]
                    ? list[2].videoId
                    : list[1] ? list[1].videoId + ':back' : null
                break
            }
            if (!child.lastVideoId || await isError()) {
                result.videoData = list[0]
                result.lastVideoId = null
                break
            }
            if (child.lastVideoId.match(':back')) {
                await refreshVideo(child) //TODO 投稿日をもとにこれにする https://site.nicovideo.jp/search-api-docs/snapshot
                const updateList = videoHashMap[child.notifyId]
                if (list.length < updateList.length) {
                    result.videoData = updateList[list.length]
                    result.lastVideoId = updateList[list.length + 1]
                        ? updateList[list.length + 1].videoId
                        : updateList[list.length].videoId + 'back'
                } else {
                    result.videoData = list[list.length - 1]
                    result.lastVideoId = child.lastVideoId
                }
                break
            }
            const index = getLastIndex()
            result.videoData = 0 <= index && index < list.length ? list[index] : null
            const lastIndex = index - 1 * nextDirection
            if (list.length <= lastIndex) {
                result.lastVideoId = child.lastVideoId + ':back'
            } else if (lastIndex < 0) {
                result.lastVideoId = null
            } else {
                result.lastVideoId = list[lastIndex].videoId
            }
            break
        }
    }
    return result
}
const setBadge = () => {
    let counter = 0
    children.forEach(v => v.isNotify ? counter++ : 0)
    browserInstance.browserAction.setBadgeText({text: counter === 0 ? '' : counter.toString()})
}
const refreshVideo = async (child) => {
    isInitVideoHashMap.pop()
    switch (child.flag) {
        case 'series':
            videoHashMap[child.notifyId] = await VideoData.getSeries(child.notifyData)
            break
        case 'tag':
            videoHashMap[child.notifyId] = await VideoData.getTags(child.notifyData, child.lastVideoId ? child.lastVideoId.replace(':back', '') : null, [], 1)
            break
    }
    isInitVideoHashMap.push(true)
}
const checkNewVideo = (child) => {
    const videoList = videoHashMap[child.notifyId]
    let videoData
    switch (child.flag) {
        case 'series':
            videoData = videoList[videoList.length - 1]
            break
        case 'tag':
            videoData = videoList[0]
            break
    }


    return videoData
        ? videoData.videoId !== child.lastVideoId && new Date(videoData.uploadDate).getTime() > child.lastCheck
        : false
}
const initVideoData = async (child) => {
    await refreshVideo(child)
    child.isNotify = checkNewVideo(child)
    setChild(child)
    setBadge()
    onCreateAlarm(child)
}

const onMassage = (msg, _, sendResponse) => {
    if (msg.key === 'load-count') {
        sendResponse({
            size: children.length,
            count: isInitVideoHashMap.length
        })
    } else new Promise((resolve) => {
        const interval = setInterval(() => {
            if (children.length === isInitVideoHashMap.length) {
                clearInterval(interval)
                resolve()
            }
        }, 1)
    }).then(() => {
        msg.value
        switch (msg.key) {
            case 'notify-add'://childを追加
                new Promise(async resolve => {
                    addChild(msg.value)
                    resolve()
                    await refreshVideo(msg.value)
                    onCreateAlarm(msg.value)
                }).then(sendResponse)
                break
            case 'notify-set'://childを更新
                new Promise(async resolve => {
                    setChild(msg.value)
                    resolve()
                    await refreshVideo(msg.value)
                    onCreateAlarm(msg.value)
                }).then(sendResponse)
                break
            case 'notify-remove'://childを削除
                removeChild(msg.value)
                sendResponse()
                break
            case 'popup': {//初回表示用データ
                const videoViews = []
                const isSuccess = []
                if (!children.length) children = NotificationDynamicChild.getAll()

                children.forEach((child, index) => {
                    new Promise(async (resolve) => {
                        if (!videoHashMap[child.notifyId]) {
                            await refreshVideo(child)
                        }
                        const {videoData} = await findVideoData(child, 'now')
                        videoViews[index] = new VideoView(child, videoData)
                        resolve()
                    }).then(() => {
                        isSuccess.push(true)
                    })
                })
                new Promise(resolve => {
                    const interval = setInterval(() => {
                        if (children.length === isSuccess.length) {
                            clearInterval(interval)
                            resolve(videoViews)
                        }
                    }, 1)
                }).then(sendResponse)
                break
            }
            case 'video-next': {//次表示する動画(lastVideoの次の次)
                const child = getChild(msg.value)
                new Promise(async (resolve) => {
                    const {videoData, lastVideoId} = await findVideoData(child, 'next')
                    child.lastVideoId = lastVideoId
                    setChild(child)
                    resolve(new VideoView(child, videoData))
                }).then(sendResponse)
                break
            }
            case 'video-prev' : {//前表示する動画(lastVideo)
                const child = getChild(msg.value)
                new Promise(async (resolve) => {
                    const {videoData, lastVideoId} = await findVideoData(child, 'prev')
                    child.lastVideoId = lastVideoId
                    setChild(child)
                    resolve(new VideoView(child, videoData))
                }).then(sendResponse)
                break
            }
            case 'notify-read' : {//isNotifyを消す
                const child = getChild(msg.value)

                child.isNotify = false
                child.lastCheck = Date.now()
                setChild(child)
                setBadge()
                sendResponse()
                break
            }
            case 'get-child'://編集用
                sendResponse(getChild(msg.value))
                break
            case 'refresh': {//特定のvideoListを更新
                const child = getChild(msg.value)
                new Promise(async (resolve) => {
                    await refreshVideo(child)
                    child.isNotify = checkNewVideo(child)
                    const {videoData} = await findVideoData(child, 'now')
                    resolve(new VideoView(child, videoData))
                    setChild(child)
                    setBadge()
                }).then(sendResponse)
                break
            }
        }
    })
    return true
}

const init = async () => {
    await BStorage.init()

    children = NotificationDynamicChild.getAll()

    browserInstance.alarms.onAlarm.addListener(async (alarm) => {
        const child = getChild(alarm.name)
        initVideoData(child).then()
    })
    for (const child of children) {
        initVideoData(child).then()
    }
    browserInstance.runtime.onMessage.addListener(onMassage)
}
browserInstance.runtime.onInstalled.addListener(init)
browserInstance.runtime.onStartup.addListener(init)


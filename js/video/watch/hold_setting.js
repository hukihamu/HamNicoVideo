const nicoStorage = {
    setPlaybackRate() {
        const holdValue = PARAMETER.VIDEO.WATCH.HOLD_SETTING.PLAYBACK_RATE.HOLD_VALUE
        localStorage.setItem('Player.playbackRate', holdValue.options[holdValue.pValue].value)
    },
    get isContinuous() {
        return localStorage.getItem('Player.isContinuous')
    },
    setContinuous() {
        localStorage.setItem('Player.isContinuous', PARAMETER.VIDEO.WATCH.HOLD_SETTING.CONTINUOUS.HOLD_VALUE.pValue)
    },
    setPlayerController() {
        const holdValue = PARAMETER.VIDEO.WATCH.HOLD_SETTING.PLAYER_CONTROLLER.HOLD_VALUE
        localStorage.setItem('PlayerPanelState.PlayerPanelType', holdValue.options[holdValue.pValue].value)
    },
    set isRepeating(value) {
        localStorage.setItem('Player.isRepeating', value)
    }
}

const page = {}

function holdSetting() {
    //0 holdしない
    //1 ページがかわれば
    //2 連続再生中いがい = 連続再生時、「次の動画」以外に飛んだとき
    //3 動画が変われば修正
    const holdSettings = PARAMETER.VIDEO.WATCH.HOLD_SETTING
    const next = []
    const all = []

    function setSetting(setting, f) {
        switch (Number.parseInt(setting['ENABLE'].pValue)) {
            case 1: {
                page[setting['ENABLE'].key] = f
                break
            }
            case 2: {
                next.push(f)
                page[setting['ENABLE'].key] = f
                break
            }
            case 3: {
                all.push(f)
                next.push(f)
                page[setting['ENABLE'].key] = f
                break
            }
        }
    }

    setSetting(holdSettings.CONTINUOUS, nicoStorage.setContinuous)
    setSetting(holdSettings.PLAYBACK_RATE, nicoStorage.setPlaybackRate)
    setSetting(holdSettings.PLAYER_CONTROLLER, nicoStorage.setPlayerController)

    //page
    window.addEventListener('setItemEvent', onHoldPage,false)
}

function onHoldPage(event) {
    switch (event.detail) {
        case 'PlayerPanelState.PlayerPanelType':{
            page['video_watch_hold_setting_player_controller_enable']()
            break
        }
        case 'Player.playbackRate':{
            page['video_watch_hold_setting_playback_rate_enable']()
            break
        }
    }
}

//<a href="/watch/sm38248121?access_from=video_error&amp;from=0" class="Link VideoErrorMessage-description-reloadLink" rel="noopener">再読み込み</a>
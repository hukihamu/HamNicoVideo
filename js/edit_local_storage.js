if ( ChromeStorage.get(OPTION_PARAM.NICOVIDEO.PLAYER_STATUS.HOLD_PLAYBACK_RATE.key)){
    nicoStorage.playbackRate = 0
}
if (OPTION_PARAM.NICOVIDEO.PLAYER_STATUS.HOLD_PANEL_STATE.param){
    nicoStorage.panelState = "comment_list"
}
if (OPTION_PARAM.NICOVIDEO.PLAYER_STATUS.HOLD_IS_NOT_CONTINUOUS.param){
    nicoStorage.isContinuous = false
}
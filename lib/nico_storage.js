const nicoStorage = {
    set playbackRate(value){
        localStorage.setItem('Player.playbackRate',value)
    },
    get isContinuous(){
        return localStorage.getItem('Player.isContinuous')
    },
    set isContinuous(value){
        localStorage.setItem('Player.isContinuous',value)
    },
    set panelState(value){
        localStorage.setItem('PlayerPanelState.PlayerPanelType',value)
    }
}
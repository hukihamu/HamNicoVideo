const nicoStorage = {
    set playbackRate(value){
        localStorage.setItem('Player.playbackRate',value)
    },
    get isContinuous(){
        return localStorage.getItem('Player.isContinuous')
    }
}
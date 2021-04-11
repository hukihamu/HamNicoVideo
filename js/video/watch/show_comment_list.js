function showCommentList() {

    const playButton = document.getElementsByClassName('ActionButton ControllerButton PlayerPlayButton')[0]
    const pauseButton = document.getElementsByClassName('ActionButton ControllerButton PlayerPauseButton')[0]

    const button = playButton ? playButton : pauseButton ? pauseButton : ()=>{
        console.error('再生ボタンが見つかりません')
        return
    }

    new MutationObserver((mutationsList)=>{
        for (const mutation of mutationsList) {
            for (const addedNode of mutation.addedNodes) {
                if (addedNode.classList.contains('PlayerPauseButton')){
                    document.getElementsByClassName('PlayerPanelContainer-tab')[0].children[0].click()
                }
            }
        }

    }).observe(button.parentElement, {
        subtree: true,
        childList: true
    })
}
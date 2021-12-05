




document.addEventListener('DOMContentLoaded', async () => {

    browserInstance.runtime.sendMessage({key: 'popup'},(videoViews)=>{
        const parent = document.getElementById('body')
        for (const object of videoViews){
            const videoView = VideoView.importVideoView(object)
            videoView.createView(parent)
        }
    })
    //ボタン初期化
    document.getElementById('notification_edit').addEventListener('click', () => {
        window.location.href = '/html/edit_notification.html?add'
    })
})
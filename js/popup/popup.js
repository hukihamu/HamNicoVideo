




document.addEventListener('DOMContentLoaded', async () => {

    const loading = document.getElementById('loading')
    loading.classList.remove('hidden')
    browserInstance.runtime.sendMessage({key: 'popup'},(videoViews)=>{
        const parent = document.getElementById('body')
        for (const object of videoViews){
            const videoView = VideoView.importVideoView(object)
            videoView.createView(parent)
        }
        loading.classList.add('hidden')
    })
    //ボタン初期化
    document.getElementById('notification_edit').addEventListener('click', () => {
        window.location.href = '/html/edit_notification.html?add'
    })
})
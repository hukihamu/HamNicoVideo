




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
    //読込中のカウント表示
    const intervalCounter = setInterval(()=>{
        browserInstance.runtime.sendMessage({key: 'load-count'},(result)=>{
            if (result.size === result.count) {
                clearInterval(intervalCounter)
                return
            }
            document.getElementById('loading_text').textContent = `${result.count}/${result.size}`
        })
    },10)

    //ボタン初期化
    document.getElementById('notification_edit').addEventListener('click', () => {
        window.location.href = '/html/edit_notification.html?add'
    })
})
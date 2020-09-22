const nicovideo = async function () {

    function initInView(inView){
        initHttpVideo()

    }
    function initHttpVideo(){
        //http_video_url
        const player = document.getElementById('MainVideoPlayer')
        const setSrc = (src)=>{
            const httpVideo = document.getElementById('http_video_url')
            if (src.match('^https:') !== null){
                httpVideo.href = src
                httpVideo.removeAttribute('title')
            }else {
                httpVideo.removeAttribute('href')
                httpVideo.title = '視聴方法がhttpではないため、利用できません。'
            }
        }
        if (player !== undefined){
            let video
            if ((video = player.firstChild) !== null){
                setSrc(video.src)
            }
            const callback = function (mutationsList) {
                for (let mutation of mutationsList){
                    setSrc(mutation.target.src)
                }
            }
            new MutationObserver(callback).observe(player, {
                subtree: true,
                attributes: true,
                attributeFilter: ['src']
            })
        }else {
            console.error('MainVideoPlayerが見つかりません')
        }
    }

    const expOption =
        '<div class="Card">' +
        '   <div class="Card-header">' +
        '       <h1 class="Card-title">拡張オプション</h1>' +
        '   </div>' +
        '   <div class="Card-main">' +
        '       <a id="http_video_url">HttpVideoURL</a>' +
        '   </div>' +
        '</div>'

    const inView = document.createElement('div')
    inView.className = 'InView'
    inView.innerHTML = expOption

    const sideGrid = document.getElementsByClassName('GridCell BottomSideContainer')[0]
    sideGrid.prepend(inView)
    initInView(inView)
}

window.onload = nicovideo

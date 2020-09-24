const nicovideo = async function () {

    function initInView(inView){
        initHttpVideo()
        initContentsTree()
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
            if (player.firstChild !== null){
                setSrc(player.firstChild.src)
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
    function initContentsTree() {
        document.getElementById('contents_tree').href =
            'http://commons.nicovideo.jp/tree/' + location.href.substring(location.href.lastIndexOf('/') + 1)
    }

    const expOption =
        '<div class="Card">' +
        '   <div class="Card-header">' +
        '       <h1 class="Card-title">拡張オプション</h1>' +
        '   </div>' +
        '   <div class="Card-main">' +
        '       <a id="http_video_url" target="_blank" rel="noopener noreferrer">HttpVideoURL</a><br>' +
        '       <style>' +
        '           #contents_tree{' +
        '               display: block;' +
        '               background-image: url(http://commons.nicovideo.jp/cpp/img/common/button/btn_tree_min.png);' +
        '               text-indent: -9999px;' +
        '               width: 102px;' +
        '               height: 18px;' +
        '               ' +
        '           }' +
        '           #contents_tree:hover{' +
        '               background-position: 0 -18px;' +
        '           }' +
        '       </style>' +
        '       <a id="contents_tree" target="_blank" rel="noopener noreferrer">コンテンツツリー</a>' +
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

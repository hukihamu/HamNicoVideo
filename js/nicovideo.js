const nicovideo = async function () {

    function getThreadId(){
        const watchData = document.getElementById('js-initial-watch-data')
        const apiData = JSON.parse(watchData.dataset['apiData'])

        return apiData['video']['dmcInfo']['thread']['thread_id']
    }

    function initInView(inView){
        initHttpVideo()
        initContentsTree()
        initDeleteShareButton()
        //initCustomMyListButton()
    }
    function initCustomMyListButton() {
        const buttonContainer = document.getElementsByClassName('VideoMenuContainer-areaLeft')[0]


        const myListStyle = document.createElement('style')
        myListStyle.type = 'text/css'
        myListStyle.innerHTML = '.AddingMylistPanelContainer:before{left: 84px;}'
        document.head.appendChild(myListStyle)

        const div = document.createElement('div')
        div.className = 'ClickInterceptor LoginRequirer is-inline'
        buttonContainer.prepend(div)

        const myListIcon = document.getElementsByClassName('MylistIcon')[0]
        const onMyList = myListIcon.parentElement.eve
        const svg = myListIcon.cloneNode()
        svg.innerHTML += '<path d="M22 0h22c.4 0 .8 0 1.1.2A8 8 0 0 1 51 4.9l3 7.1H92a8 8 0 0 1 8 8v56a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8h14zm48.2 53.4v-11a1.3 1.3 0 0 1 1.2-1.2h5.2a1.3 1.3 0 0 1 1.2 1.3v10.9h11a1.3 1.3 0 0 1 1.2 1.2v5.2a1.3 1.3 0 0 1-1.3 1.2H77.8v11a1.3 1.3 0 0 1-1.2 1.2h-5.2a1.3 1.3 0 0 1-1.2-1.3V61h-11a1.3 1.3 0 0 1-1.2-1.2v-5.2a1.3 1.3 0 0 1 1.3-1.2h10.9zM24"></path>'

        const button = document.createElement('button')
        button.dataset['title'] = 'カスタムマイリスト'
        button.type = 'button'
        button.className = 'ActionButton VideoMenuContainer-button'
        button.onclick = onMyList//showMyList
        button.appendChild(svg)
        div.appendChild(button)

    }
    function showMyList(){
        console.log(getThreadId())
        //https://flapi.nicovideo.jp/api/watch/mylists?thread_id=1601797384
    }

    function initDeleteShareButton() {
        const twitterButton = document.getElementsByClassName('TwitterShareButton')[0]
        twitterButton.remove()
        const facebookButton = document.getElementsByClassName('FacebookShareButton')[0]
        facebookButton.remove()
        const lineButton = document.getElementsByClassName('LineShareButton')[0]
        lineButton.remove()
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
            const firstChild = player.firstChild
            if (firstChild !== null){
                setSrc(firstChild.src)
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
        '       <style>' +
        '           #contents_tree{' +
        '               display: block;' +
        '               background-image: url(http://commons.nicovideo.jp/images/common/button/btn_tree_min.png);' +
        '               text-indent: -9999px;' +
        '               width: 102px;' +
        '               height: 18px;' +
        '               ' +
        '           }' +
        '           #contents_tree:hover{' +
        '               background-position: 0 -18px;' +
        '           }' +
        '       </style>'+
        '       <a id="http_video_url" target="_blank" rel="noopener noreferrer">HttpVideoURL</a><br>' +
        '       <a id="contents_tree" target="_blank" rel="noopener noreferrer">コンテンツツリー</a>' +
        '   </div>' +
        '</div>'
    const inView = document.createElement('div')
    inView.className = 'InView'
    inView.innerHTML = expOption

    //document.body.innerHTML += expStyle

    const sideGrid = document.getElementsByClassName('GridCell BottomSideContainer')[0]
    sideGrid.prepend(inView)
    initInView(inView)

}

window.onload = nicovideo

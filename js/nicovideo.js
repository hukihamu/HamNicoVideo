const nicovideo = async function () {

    const httpVideoButton = document.createElement('button')
    httpVideoButton.innerText = 'HttpVideoURL'
    const expOption =
        '<div class="Card">' +
        '   <div class="Card-header">' +
        '       <h1 class="Card-title">拡張オプション</h1>' +
        '   </div>' +
        '   <div class="Card-main">' +
        '   </div>' +
        '</div>'

    const inView = document.createElement('div')
    inView.className = 'InView'
    inView.innerHTML = expOption

    const sideGrid = document.getElementsByClassName('GridCell BottomSideContainer')[0]
    sideGrid.prepend(inView)
}

window.onload = nicovideo

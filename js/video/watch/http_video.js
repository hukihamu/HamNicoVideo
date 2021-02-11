function httpVideo(){

    const video = document.getElementsByTagName('video')[0]
    if (localStorage.getItem('isHttp') === 'true'){
        localStorage.setItem('DMCSource.isHLSDisabled',false)
        localStorage.setItem('isHttp',false)
        if (video.src != null && video.src !== ''){
            location.href = video.src
        }else {
            new MutationObserver((mutationsList,observer)=>{
                observer.disconnect()
                location.href = mutationsList[0].target.src
            }).observe(video, {
                attributes: true,
                attributeFilter: ['src']
            })
        }
        return
    }

    const a = document.createElement('a')
    a.innerText = 'http動画'
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    if (localStorage.getItem('DMCSource.isHLSDisabled') === 'true'){
        if (video.src != null && video.src !== ''){
            a.href = video.src
        }else {
            new MutationObserver((mutationsList,observer)=>{
                observer.disconnect()
                a.href = mutationsList[0].target.src
            }).observe(video, {
                attributes: true,
                attributeFilter: ['src']
            })
        }
    }else {
        a.href = location.origin + location.pathname
        a.onclick = function (){
            localStorage.setItem('DMCSource.isHLSDisabled',true)
            localStorage.setItem('isHttp',true)
        }
    }
    document.getElementById('Ham-Card-main').appendChild(a)
}
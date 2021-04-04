const repo = async function () {
    await BStorage.init()

    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = browserInstance.runtime.getURL("css/nico_repo.css");
    document.head.appendChild(cssLink)

    let cl = function () {}
    if (PARAMETER.VIDEO.REPO.CUSTOM_LAYOUT.pValue) cl = customLayout

    let f = function () {}
    if (PARAMETER.VIDEO.REPO.FILTER.ENABLE.pValue) {
        f = applyFilter
    }

    const userPageMain = document.getElementsByClassName('UserPage-main')[0]
    const userPageMainCallback = function (mutationsList, observer) {
        if (location.pathname.match('^(/my/|/my|/my/nicorepo|/my/nicorepo/)')) for (let mutation of mutationsList) {
            const target = mutation.addedNodes[0]
            if (target !== undefined && target.className !== undefined) {
                if (target.className === 'NicorepoTimeline') {
                    for (const child of target.getElementsByClassName('SlideOut NicorepoItem NicorepoTimeline-item')) {
                        cl(child)
                        f(child)
                    }
                } else if (target.className.match('SlideOut NicorepoItem NicorepoTimeline-item')) {
                    cl(target)
                    f(target)
                }
                if (!document.getElementById('nicorepo-filter')){
                    setSideSetting()
                }
            }
        }
    }
    new MutationObserver(userPageMainCallback).observe(userPageMain, {
        subtree: true,
        childList: true
    })
}

window.addEventListener('DOMContentLoaded', repo)

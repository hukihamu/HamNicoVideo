const repo = async function () {
    await BStorage.init()

    let cl = function () {}
    if (PARAMETER.VIDEO.REPO.CUSTOM_LAYOUT.pValue) cl = customLayout
    let ah = function () {}
    if (PARAMETER.VIDEO.REPO.HIGHLIGHT.ENABLE.pValue) ah = applyHighlight
    let awl = function () {}
    if (PARAMETER.VIDEO.REPO.ADD_WATCH_LATER.pValue) awl = addWatchLater

    let f = function () {}
    if (PARAMETER.VIDEO.REPO.FILTER.ENABLE.pValue) {
        f = applyFilter
    }

    const userPageMain = document.getElementsByClassName('UserPage-main')[0]
    const userPageMainCallback = function (mutationsList, _) {
        if (location.pathname.match('^(/my/|/my|/my/nicorepo|/my/nicorepo/)')) for (let mutation of mutationsList) {
            const target = mutation.addedNodes[0]
            if (target !== undefined && target.className !== undefined) {
                if (target.className === 'NicorepoTimeline' || target.className === 'NicorepoPage') {
                    for (const child of target.getElementsByClassName('SlideOut NicorepoItem NicorepoTimeline-item')) {
                        cl(child)
                        ah(child)
                        awl(child)
                        f(child)
                        createdAtNewColor(child)
                    }
                } else if (target.className.match('SlideOut NicorepoItem NicorepoTimeline-item')) {
                    cl(target)
                    ah(target)
                    awl(target)
                    f(target)
                    createdAtNewColor(target)
                }
                if (!document.getElementById('nicorepo-filter')
                        && document.getElementsByClassName('SideContainer NicorepoSideContainer')[0]){
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

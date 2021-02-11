const repo = async function () {
    await BStorage.init()

    let cl = function () {
    }
    if (PARAMETER.VIDEO.REPO.CUSTOM_LAYOUT.ENABLE.pValue) cl = customLayout

    let f = function () {
    }
    if (PARAMETER.VIDEO.REPO.FILTER.ENABLE.pValue) {
        f = applyFilter
    }

    const userPageMain = document.getElementsByClassName('UserPage-main')[0]
    const userPageMainCallback = function (mutationsList, observer) {
        if (location.pathname === '/my/' || location.pathname === '/my') for (let mutation of mutationsList) {
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
                }else if (target.className === 'NicorepoPage'){
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

//あとでみるボタン
//https://www.nicovideo.jp/api/deflist/add
//post
//item_id: sm38248121

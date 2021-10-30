chrome.runtime.onMessage.addListener((msg, _, callback) => {
    switch (msg.state) {
        case 'add': {
            chrome.storage.local.get(null, (items) => {

                items['video/notification/list'] = []
                chrome.storage.local.set(items, () => {
                    console.log(items)
                })
            })
            callback()
            break
        }
    }
})
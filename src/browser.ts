const getBrowser = () => {
    if (chrome) {
        return chrome
    } else {
        // @ts-ignore
        if (browser) {
            // @ts-ignore
            return browser
        } else {
            throw '異なるブラウザで実行している可能性があります'
        }
    }
}

export const BROWSER = {
    storage: getBrowser().storage,
    tabs: getBrowser().tabs,
    onConnect: getBrowser().runtime.onConnect,
    connect: getBrowser().connect,
    onStartup: getBrowser().onStartup,
    onInstalled: getBrowser().onInstalled,
    alarms: getBrowser().alarms,
}
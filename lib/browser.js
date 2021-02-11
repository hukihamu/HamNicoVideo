



//ブラウザチェック
const userAgent = window.navigator.userAgent.toLowerCase()
let browserInstance

if (userAgent.indexOf('chrome') !== -1) {
    browserInstance = chrome
} else if (userAgent.indexOf('firefox') !== -1) {
    browserInstance = browser
} else {
    console.error('知らないブラウザ')
}
//ブラウザチェック
const userAgent = window.navigator.userAgent.toLowerCase();
let browserInstance

if(userAgent.indexOf('chrome') !== -1) {
    browserInstance = chrome
} else if(userAgent.indexOf('firefox') !== -1) {
    browserInstance = browser
} else {
    console.error('知らないブラウザ')
}



//storage
class BrowserStorage{

    static keys(){
        return Object.keys(this.defaults)
    }

    static get(key){
        if (typeof this.cache[key] == 'undefined') {
            if (typeof this.defaults[key] == 'undefined') {
                console.warn(`Unrecognized SyncedStorage key '${key}'`);
            }
            return this.defaults[key];
        }
        return this.cache[key]
    }
    static set(key,value){
        this.cache[key] = value
        this.adapter.set({[key]: value})
    }

    static async init(){
        browserInstance.storage.onChanged.addListener(changes => {
            for (let [key, { newValue: val, }] of Object.entries(changes)) {
                this.cache[key] = val
            }
        })

        return new Promise((resolve) =>{
            this.adapter.get(null,(storage) =>{
                resolve(Object.assign(this.cache, storage))
            })
        })
    }
}
BrowserStorage.adapter = browserInstance.storage.local
BrowserStorage.cache = {}
BrowserStorage.defaults = function (){
    const find = function(object, map){
        if (object instanceof OptionParam){
            map[object.key] = object.default
            return map
        }else {
            const objects = Object.values(object)
            for (let i = 0; i < objects.length;i++){
                map = find(objects[i],map)
            }
        }
        return map
    }
    return find(OPTION_PARAM,{})
}()
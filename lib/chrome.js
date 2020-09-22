//storage
class ChromeStorage{

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
        return this.adapter.set({[key]: value})
    }

    static async init(){
        chrome.storage.onChanged.addListener(changes => {
            for (let [key, { newValue: val, }] of Object.entries(changes)) {
                this.cache[key] = val
            }
        })
        await this.adapter.get(null,function (result) {
            Object.assign(ChromeStorage.cache, result)
        })

        return this.cache
    }
}
ChromeStorage.adapter = chrome.storage.local
ChromeStorage.cache = {}
ChromeStorage.defaults = function (){
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
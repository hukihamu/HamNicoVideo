type MessageType = {
    add: {
        args: ValuesSeries,
        result: void
    },
    list: {
        args: undefined,
        result: unknown[] // TODO
    }
}
type MessageArgs<K extends keyof MessageType> = {
    key: K,
    value: MessageType[K]['args']
}
export default {
    send: <K extends keyof MessageType>
    (key: K, args: MessageType[K]['args'], resultCallback: (resultValue: MessageType[K]['result']) => void) => {
        chrome.runtime.sendMessage<MessageArgs<K>, MessageType[K]['result']>({key, value: args}).then(resultCallback)
    },
    setListener: <K extends keyof MessageType>
    (listener: (args: MessageArgs<K>)=>MessageType[K]['result'])=>{
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            const args = message as MessageArgs<K>
            new Promise(resolve =>{
                resolve(listener(args))
            }).then(value => sendResponse(value))
            return true
        })
    }

}
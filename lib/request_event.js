var xhrOverrideScript = document.createElement('script');
xhrOverrideScript.textContent = `
const originalFetch = fetch;
fetch = function (input ,init){
    const response = originalFetch.apply(this, arguments);
    const originalThen = response.then;
    response.then = function (onfulfilled,onrejected){
        const originalonfulfilled = onfulfilled;
        onfulfilled = function (res){
            replaceResp(res);
            return originalonfulfilled.apply(this, arguments);
        }
        
        return originalThen.apply(this, arguments);
    };
    return response;
};
function replaceResp (res){
    if (res.url === 'https://nmsg.nicovideo.jp/api.json'){
        const crJson = JSON.parse(localStorage.getItem('comment_replace'));
        for(let i = 0; i < crJson.length; i++){
            crJson[i].regex = new RegExp(crJson[i].regex);
        }
        const originalJson = res.json;
        res.json = function (){
            const j = originalJson.apply(this, arguments);
            const originalThen = j.then;
            j.then = function (onfulfilled,onrejected){
                const originalonfulfilled = onfulfilled;
                onfulfilled = function (r){
                    for (const c of r){
                        const chat = c['chat'];
                        if (chat){
                            // console.log('mail: ' + chat.mail+'\\nfork: ' + chat.fork+'\\ncontent: ' + chat.content+'\\nnicoru: ' + chat.nicoru);
                            // chat.content = '草';
                            const oldContent = chat.content;
                            if (oldContent){
                                for (const cr of crJson){
                                    const newContent = oldContent.replace(cr.regex,cr.replaceValue);
                                    if (newContent !== oldContent){
                                        chat.content = newContent;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    return originalonfulfilled.apply(this, arguments);
                }
                return originalThen.apply(this, arguments);
            };
            return j 
        }
    }
}
`;
const si = setInterval(()=>{
    if (BStorage.isInit){
        clearInterval(si)
        if (PARAMETER.VIDEO.WATCH.COMMENT_REPLACE.ENABLE.pValue){
            (document.head || document.documentElement).prepend(xhrOverrideScript);
            localStorage.setItem('comment_replace',PARAMETER.VIDEO.WATCH.COMMENT_REPLACE.REPLACE_VALUE.pValue)
        }
    }
},1)
//チャンネル
// last_res: 1326
// resultcode: 0
// revision: 1
// server_time: 1622865734
// thread: "1583474165"
// ticket: "0x77f62f89"
//チャンネルコメント
//last_res: 597
// resultcode: 0
// revision: 1
// server_time: 1622866084
// thread: "1583474177"
// ticket: "0x775e8caa"

//引用
// last_res: 3379
// resultcode: 0
// revision: 1
// server_time: 1622865734
// thread: "1548056825"
// ticket: "0x2e371dd1"

//簡単コメントP
// fork: 2
// last_res: 15
// resultcode: 0
// revision: 1
// server_time: 1622865734
// thread: "1583474165"
// ticket: "0xfdd6b375"


//TODO
// "isTranslucent": false,
// [{
// 		"id": 1539753976,
// 		"fork": 1,
// 		"isActive": false,
// 		"postkeyStatus": 0,
// 		"isDefaultPostTarget": false,
// 		"isThreadkeyRequired": false,
// 		"isLeafRequired": false,
// 		"label": "owner",
// 		"isOwnerThread": true,
// 		"hasNicoscript": true
// 	}, {
// 		"id": 1539753976,
// 		"fork": 0,
// 		"isActive": true,
// 		"postkeyStatus": 0,
// 		"isDefaultPostTarget": false,
// 		"isThreadkeyRequired": false,
// 		"isLeafRequired": true,
// 		"label": "default",
// 		"isOwnerThread": false,
// 		"hasNicoscript": false
// 	}, {
// 		"id": 1539753977,
// 		"fork": 0,
// 		"isActive": true,
// 		"postkeyStatus": 0,
// 		"isDefaultPostTarget": true,
// 		"isThreadkeyRequired": true,
// 		"isLeafRequired": true,
// 		"label": "community",
// 		"isOwnerThread": false,
// 		"hasNicoscript": false
// 	}, {
// 		"id": 1539753977,
// 		"fork": 2,
// 		"isActive": true,
// 		"postkeyStatus": 0,
// 		"isDefaultPostTarget": false,
// 		"isThreadkeyRequired": true,
// 		"isLeafRequired": true,
// 		"label": "easy",
// 		"isOwnerThread": false,
// 		"hasNicoscript": false
// 	}, {
// 		"id": 1540173302,
// 		"fork": 0,
// 		"isActive": true,
// 		"postkeyStatus": 0,
// 		"isDefaultPostTarget": false,
// 		"isThreadkeyRequired": true,
// 		"isLeafRequired": true,
// 		"label": "extra-community",
// 		"isOwnerThread": false,
// 		"hasNicoscript": false
// 	}, {
// 		"id": 1540173302,
// 		"fork": 2,
// 		"isActive": true,
// 		"postkeyStatus": 0,
// 		"isDefaultPostTarget": false,
// 		"isThreadkeyRequired": true,
// 		"isLeafRequired": true,
// 		"label": "extra-easy",
// 		"isOwnerThread": false,
// 		"hasNicoscript": false
// 	}],
// 	"layers": [{
// 		"index": 0,
// 		"isTranslucent": false,
// 		"threadIds": [{
// 			"id": 1539753976,
// 			"fork": 1
// 		}]
// 	}, {
// 		"index": 1,
// 		"isTranslucent": false,
// 		"threadIds": [{
// 			"id": 1539753977,
// 			"fork": 0
// 		}, {
// 			"id": 1539753977,
// 			"fork": 2
// 		}]
// 	}, {
// 		"index": 2,
// 		"isTranslucent": true,
// 		"threadIds": [{
// 			"id": 1539753976,
// 			"fork": 0
// 		}]
// 	}, {
// 		"index": 3,
// 		"isTranslucent": true,
// 		"threadIds": [{
// 			"id": 1540173302,
// 			"fork": 0
// 		}, {
// 			"id": 1540173302,
// 			"fork": 2
// 		}]
// 	}]
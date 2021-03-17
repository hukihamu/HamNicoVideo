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
    if (res.url === 'https://nmsg.nicovideo.jp/api.json/'){
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
                            console.log('mail: ' + chat.mail+'\\nfork: ' + chat.fork+'\\ncontent: ' + chat.content+'\\nnicoru: ' + chat.nicoru);
                            console.log(chat);
                            // chat.content = '草';
                        }else{
                            console.log(c);
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
// (document.head || document.documentElement).prepend(xhrOverrideScript);

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
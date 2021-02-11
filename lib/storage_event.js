var script = document.createElement('script')
script.textContent = 'const originalSetItem = localStorage.setItem;localStorage.setItem = function (key, value) {const setItemEvent = new CustomEvent(\'setItemEvent\',{ detail: key});originalSetItem.apply(this, arguments);window.dispatchEvent(setItemEvent);}';
(document.head || document.documentElement).prepend(script)
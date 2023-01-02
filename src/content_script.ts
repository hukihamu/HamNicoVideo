import my_page from '@/video/my_page';
import storage from '@/storage';
import watch from '@/video/watch';


const content_script = async ()=>{
    await storage.init()
    const url = location.href
    // URL識別をして、適切なtsを実行
    if (url.match(/https:\/\/www.nicovideo.jp\/my/)){
        my_page()
    }
    if (url.match(/https:\/\/www.nicovideo.jp\/watch/)){
        watch()
    }
}
window.addEventListener('DOMContentLoaded', content_script)
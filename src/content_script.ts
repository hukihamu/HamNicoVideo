import my_page from '@/video/my_page';
import storage from '@/storage';


const content_script = async ()=>{
    await storage.init()
    const url = location.href
    // TODO URL識別をして、適切なtsを実行
    if (url.match(/https:\/\/www.nicovideo.jp\/my/)){
        my_page()
    }
}
window.addEventListener('DOMContentLoaded', content_script)
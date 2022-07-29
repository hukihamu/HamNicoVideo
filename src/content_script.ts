import nico_repo from '@/video/my_page/nico_repo';
import storage from '@/storage';


const content_script = async ()=>{
    await storage.init()
    const url = location.href
    // TODO URL識別をして、適切なtsを実行
    if (url.match(/https:\/\/www.nicovideo.jp\/my/)){
        nico_repo()
    }
}
window.addEventListener('DOMContentLoaded', content_script)
import my_page from '@/video/my_page';
import storage from '@/storage';
import watch from '@/video/watch';


const content_script = async ()=>{
    await storage.init()
    const url = location.href
    // TODO URL識別をして、適切なtsを実行
    if (url.match(/https:\/\/www.nicovideo.jp\/my/)){
        my_page()
    }
    if (url.match(/https:\/\/www.nicovideo.jp\/watch/)){
        watch()
    }
}
window.addEventListener('DOMContentLoaded', content_script)

/*
TODO
 旧データの移行
 オプションの保存
 オプションの入出力
 通知追加
 通知表示
 通知-> 極力APIを利用, 見つからない場合諦めて最新の動画表示, なるたけ共通で処理できるように
 */
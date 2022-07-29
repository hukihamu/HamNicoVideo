import my_page from './video/my_page';

const url = location.href
// TODO URL識別をして、適切なtsを実行
if (url.match(/https:\/\/www.nicovideo.jp\/my/)){
    my_page()
}
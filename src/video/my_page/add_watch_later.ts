import {OnSetRepoItem} from '@/video/type_on_set';
import {watchLater} from '@/nico_client/watch_later';


export const onSetAddWatchLater: OnSetRepoItem = itemElement => {
    if (itemElement.getElementsByClassName('ContentLabel_video').length > 0){
        const button = document.createElement('button')
        button.className = 'WatchLaterButton-button'
        button.dataset.title = 'あとで見る'
        button.dataset.url = (itemElement.getElementsByClassName('NicorepoItem-content')[0] as HTMLAnchorElement).href
        button.addEventListener('click',onClickWatchLater)

        const div = document.createElement('div')
        div.className = 'WatchLaterButton'
        div.style.position = 'initial'
        div.style.marginRight = "0"
        div.style.marginTop = "0"
        div.style.marginBottom = 'auto'
        div.style.marginLeft = 'auto'
        div.appendChild(button)

        const sender = itemElement.getElementsByClassName('NicorepoItem-sender')[0]
        sender.appendChild(div)
    }
}

function onClickWatchLater(this: HTMLButtonElement){

    const watchId = this.dataset.url.replace('https://www.nicovideo.jp/watch/','')
    this.dataset.title = '更新中'

    watchLater.addWatchLater(watchId, ()=>{
        this.classList.remove('is-succeeded')
        this.classList.remove('is-failed')
        this.dataset['title'] = 'あとで見る'
    }, ()=>{
        this.classList.add('is-succeeded')
        this.dataset['title'] = '「あとで見る」に追加しました'
    },()=>{
        this.classList.add('is-failed')
        this.dataset['title'] = 'すでに「あとで見る」に追加されています'
    },()=>{
        this.classList.add('is-failed')
        this.dataset['title'] = '「あとで見る」への追加に失敗'
    })
}
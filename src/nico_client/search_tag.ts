import {VideoDetailPostData} from '@/post_data/video_detail_post_data';
import Util from '@/util';

type TagType = {

}
// 1page 32件
export const searchTag = {
    // return配列は、ページ分のlengthを確保
    getPage: async (tagText: string, page: number): Promise<(VideoDetailPostData|undefined)[]>=>{
        return fetch(`https://www.nicovideo.jp/tag/${tagText}?sort=f&order=a&page=${page}`,{
            credentials: 'omit'
        }).then(resp =>resp.text()).then(text =>{
            const dom = (new DOMParser()).parseFromString(text, 'text/html')
            const totalText = dom.getElementsByClassName('num')[0].textContent ?? Util.throwText('タグ総件数が見つかりません')
            const total = Number.parseInt(totalText.replace(',',''))
            const result: (VideoDetailPostData | undefined)[] = new Array(total)
            const tagElements = dom.getElementsByClassName('contentBody video uad videoList')[0].children[1]
            let adCounter = 0
            for (let i = 0; i < tagElements.children.length;i++){
                const element = tagElements.children[i]
                // ニコニ広告
                if (element.classList.contains('nicoadVideoItem')) {
                    adCounter--
                    continue
                }
                // センシティブ
                if (element.hasAttribute('data-video-item-sensitive')) continue
                const timeArray: number[] = element.getElementsByClassName('videoLength')[0].textContent?.split(':').reverse().map(it => Number.parseInt(it)) ?? Util.throwText('動画時間取得に失敗')
                const seconds = timeArray[0] + timeArray[1] * 60 + (timeArray[2] ?? 0) * 360;
                result[i - adCounter + (page - 1) * 32] = {
                    viewCounter: Number.parseInt(element.getElementsByClassName('count view')[0].children[0].textContent?.replace(',','') ?? Util.throwText('再生数取得に失敗')),
                    commentNum: Number.parseInt(element.getElementsByClassName('count comment')[0].children[0].textContent?.replace(',','') ?? Util.throwText('コメント数取得に失敗')),
                    likeCounter: Number.parseInt(element.getElementsByClassName('count like')[0].children[0].textContent?.replace(',','') ?? Util.throwText('いいね数取得に失敗')),
                    myListCounter: Number.parseInt(element.getElementsByClassName('count mylist')[0].children[0].textContent?.replace(',','') ?? Util.throwText('マイリスト数取得に失敗')),
                    isCH: false, // TODO
                    thumbnailUrl: element.getElementsByClassName('thumb')[0].getAttribute('data-original') ?? Util.throwText('サムネイル取得に失敗'),
                    isPaid: false, // TODO
                    description: element.getElementsByClassName('itemDescription')[0].textContent ?? '',
                    length: seconds,
                    title: element.getElementsByClassName('itemTitle')[0].children[0].getAttribute('title') ?? Util.throwText('動画名取得に失敗'),
                    isPremiumOnly: false, // TODO
                    watchId: element.getAttribute('data-video-id') ?? Util.throwText('動画ID取得に失敗'),
                    firstRetrieve: element.getElementsByClassName('time')[0].textContent ?? Util.throwText('投稿日取得に失敗')
                }
            }
            console.log(result)
            return result
        })
    },
}
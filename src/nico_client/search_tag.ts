import {VideoDetailPostData} from '@/post_data/video_detail_post_data';
import Util from '@/util';

// 1ページ大体32件
export const searchTag = {
    // return配列は、ページ分のlengthを確保
    getPage: async (tagText: string, page: number): Promise<(VideoDetailPostData|undefined)[]>=>{
        return fetch(`https://sp.nicovideo.jp/api/tag/${tagText}?sort=f&order=a&page=${page}`).then(resp =>resp.text()).then(text =>{
            return toPostData(text)
        })
    },
    getNewPage: async (tagText: string): Promise<(VideoDetailPostData|undefined)[]>=>{
        return fetch(`https://sp.nicovideo.jp/api/tag/${tagText}?sort=f&order=d&page=1`).then(resp =>resp.text()).then(text => {
            return toPostData(text).reverse()
        })
    },
}
type DataContext = {
    "total_count": number
    "page": number
    "max_page": number
    "video_count_after_middle_banner":number
}
const toPostData = (text: string) => {
    const dom = (new DOMParser()).parseFromString(text, 'text/html')
    const dataContext: DataContext = JSON.parse((dom.getElementsByClassName('jsSearchResultContainer')[0] as HTMLDivElement).dataset['context'] ?? Util.throwText('jsSearchResultContainer の取得に失敗しました'))
    const result: (VideoDetailPostData | undefined)[] = new Array(dataContext.total_count)
    const videoList = dom.getElementById('jsVideoListPage' + dataContext.page) ?? Util.throwText('jsVideoListPage の取得に失敗しました')
    let index = Util.calcTagSearchStartIndex(dataContext.page)
    for (const videoItem of Array.from(videoList.children) as HTMLLIElement[]){
        if (videoItem.classList.contains('list-item-banner')) {
            // バナー
            continue
        }
        const data = videoItem.dataset
        if (videoItem.getElementsByClassName('video-item-nicoadLabel').length !== 0){
            // にこに広告
            continue
        }
        result[index] = {
            isPremiumOnly: videoItem.getElementsByClassName('video-item-premiumOnlyLabel').length !== 0,
            likeCounter: Number.parseInt(data['like_counter'] ?? Util.throwText('like_counter の取得に失敗しました')),
            watchId: data['watch_id'] ?? Util.throwText('watch_id の取得に失敗しました'),
            commentNum: Number.parseInt(data['comment_counter'] ?? Util.throwText('comment_counter の取得に失敗しました')),
            isCH: videoItem.getElementsByClassName('video-item-channelLabel').length !== 0,
            isPaid: videoItem.getElementsByClassName('video-item-ppvLabel').length !== 0,
            length: Number.parseInt(data['video_length'] ?? Util.throwText('video_length の取得に失敗しました')),
            title: data['title'] ?? Util.throwText('title の取得に失敗しました'),
            myListCounter: Number.parseInt(data['mylist_counter'] ?? Util.throwText('mylist_counter の取得に失敗しました')),
            viewCounter: Number.parseInt(data['view_counter'] ?? Util.throwText('view_counter の取得に失敗しました')),
            // 利用前に取得
            thumbnailUrl: '',
            firstRetrieve: '',
            description: '',
        }
        index++
    }
    return result
}
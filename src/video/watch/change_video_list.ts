// TODO 後で見るや、投稿動画など動画リストに表示切り替えする
import {OnSetCardGrid} from '@/video/type_on_set';

export const onSetChangeVideoList: OnSetCardGrid = (grid, createGridCell) => {
    const watchLater = createGridCell(grid, true)
    const watchLaterA = document.createElement('a')
    watchLaterA.href = '?playlist=eyJ0eXBlIjoid2F0Y2hsYXRlciIsImNvbnRleHQiOnsic29ydEtleSI6ImFkZGVkQXQiLCJzb3J0T3JkZXIiOiJkZXNjIn19'
    watchLaterA.innerText = 'あとで見るリスト'
    watchLaterA.rel = 'noopener'
    watchLater.appendChild(watchLaterA)

    // TODO 一意のIDだった
    // const videoUp = createGridCell(grid, true)
    // const videoUpA = document.createElement('a')
    // videoUpA.href = '?playlist='
    // videoUpA.innerText = '投稿動画リスト'
    // videoUpA.rel = 'noopener'
    // videoUp.appendChild(videoUpA)
}
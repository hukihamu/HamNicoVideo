interface RepoMatcherType{
    valueId: keyof NicoRepoMatcherType
    name: string
    matcher: string
}
export interface NicoRepoMatcherType {
    AD: RepoMatcherType,
    LIKE: RepoMatcherType,
    KIRI: RepoMatcherType,
    MY_LIST: RepoMatcherType,
    LIVE_START: RepoMatcherType,
    LIVE_PLAN: RepoMatcherType,
    VIDEO_UP: RepoMatcherType,
    VIDEO_LIVE: RepoMatcherType,
    VIDEO_LIVE_PLAN: RepoMatcherType,
    IMAGE_UP: RepoMatcherType,
    IMAGE_CLIP: RepoMatcherType,
    BLOG_UP: RepoMatcherType,
    MANGA_UP: RepoMatcherType,
    MANGA_FAV: RepoMatcherType
    MODEL_UP: RepoMatcherType,
    MODEL_FAV: RepoMatcherType
    FOLLOW: RepoMatcherType,
}

export const nicoRepoMatcher: NicoRepoMatcherType = {
    AD: {valueId: 'AD', name: 'ニコニ広告', matcher: '^ニコニ広告しました'},
    LIKE: {valueId: 'LIKE', name: 'いいね', matcher: '^動画を「いいね！」しました$'},
    KIRI: {valueId: 'KIRI', name: 'キリ番', matcher: '再生を達成しました$'},
    MY_LIST: {valueId: 'MY_LIST', name: 'マイリスト', matcher: '^マイリスト'},
    LIVE_START: {valueId: 'LIVE_START', name: '生放送開始', matcher: '生放送を開始しました$'},
    LIVE_PLAN: {valueId: 'LIVE_PLAN', name: '生放送予約', matcher: '生放送予定です$'},
    VIDEO_UP: {valueId: 'VIDEO_UP', name: '動画投稿', matcher: '^動画を投稿しました$|^動画を登録しました$'},
    VIDEO_LIVE: {valueId: 'VIDEO_LIVE', name: 'ライブ投稿', matcher: '^動画のライブ公開を開始しました$'},
    VIDEO_LIVE_PLAN: {valueId: 'VIDEO_LIVE_PLAN', name: 'ライブ投稿予約', matcher: '動画のライブ公開を予約しました$'},
    IMAGE_UP: {valueId: 'IMAGE_UP', name: '静画投稿', matcher: '^イラストを投稿しました$'},
    IMAGE_CLIP: {valueId: 'IMAGE_CLIP', name: '静画クリップ', matcher: '^イラストをクリップしました$'},
    BLOG_UP: {valueId: 'BLOG_UP', name: 'ブロマガ', matcher: '^ブロマガを投稿しました$'},
    MANGA_UP: {valueId: 'MANGA_UP', name: 'マンガ投稿', matcher: 'マンガ'},// TODO
    MANGA_FAV: {valueId: 'MANGA_FAV', name: 'マンガお気に入り', matcher: '^マンガをお気に入り登録しました$'},
    MODEL_UP: {valueId: 'MODEL_UP', name: 'ニコニ立体投稿', matcher: '^ニコニ立体に作品を投稿しました$'},
    MODEL_FAV: {valueId: 'MODEL_FAV', name: 'ニコニ立体お気に入り', matcher: '^ニコニ立体の作品をお気に入り登録しました$'},
    FOLLOW: {valueId: 'FOLLOW', name: 'フォロー通知', matcher: 'さんにフォローされました'}
    // TODO ゲームを投稿しました
}
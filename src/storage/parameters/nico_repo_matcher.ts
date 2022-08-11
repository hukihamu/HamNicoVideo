type RepoMatcherType = {
    name: string
    matcher: string
}
export type NicoRepoMatcherType = {
    AD: RepoMatcherType,
    LIKE: RepoMatcherType,
    KIRI: RepoMatcherType,
    MY_LIST: RepoMatcherType,
    LIVE: RepoMatcherType,
    LIVE_PLAN: RepoMatcherType,
    VIDEO_UP: RepoMatcherType,
    VIDEO_LIVE: RepoMatcherType,
    VIDEO_LIVE_PLAN: RepoMatcherType,
    IMAGE: RepoMatcherType,
    IMAGE_CLIP: RepoMatcherType,
    BLOG: RepoMatcherType,
    MANGA: RepoMatcherType,
    // MANGA_UP
    MANGA_FAV: RepoMatcherType
    MODEL: RepoMatcherType,
    // MODEL_UP
    MODEL_FAV: RepoMatcherType
    FOLLOW: RepoMatcherType,
}

export const nicoRepoMatcher: NicoRepoMatcherType = {
    AD: {name: 'ニコニ広告', matcher: '^ニコニ広告しました'},
    LIKE: {name: 'いいね', matcher: '^動画を「いいね！」しました$'},
    KIRI: {name: 'キリ番', matcher: '再生を達成しました$'},
    MY_LIST: {name: 'マイリスト', matcher: '^マイリスト'},
    LIVE: {name: '生放送開始', matcher: '生放送を開始しました$'},
    LIVE_PLAN: {name: '生放送予約', matcher: '生放送予定です$'},
    VIDEO_UP: {name: '動画投稿', matcher: '^動画を投稿しました$|^動画を登録しました$'},
    VIDEO_LIVE: {name: 'ライブ投稿', matcher: '^動画のライブ公開を開始しました$'},
    VIDEO_LIVE_PLAN: {name: 'ライブ投稿予約', matcher: '動画のライブ公開を予約しました$'},
    IMAGE: {name: '静画投稿', matcher: '^イラストを投稿しました$'},
    IMAGE_CLIP: {name: '静画クリップ', matcher: '^イラストをクリップしました$'},
    BLOG: {name: 'ブロマガ', matcher: '^ブロマガを投稿しました$'},
    MANGA: {name: 'マンガ', matcher: '^マンガ$'},// TODO
    // MANGA_UP: {name: '', matcher: 'マンガ'},// TODO
    MANGA_FAV: {name: 'マンガお気に入り', matcher: '^マンガをお気に入り登録しました$'},
    MODEL: {name: 'ニコニ立体', matcher: '^ニコニ立体$'},// TODO
    // MODEL_UP: {name: 'ニコニ立体投稿', matcher: '^ニコニ立体に作品を投稿しました$'},
    MODEL_FAV: {name: 'ニコニ立体お気に入り', matcher: '^ニコニ立体の作品をお気に入り登録しました$'},
    FOLLOW: {name: 'フォロー通知', matcher: 'さんにフォローされました'}
    // TODO ゲームを投稿しました
}
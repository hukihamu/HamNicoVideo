# TODO
- [ ] syncの使い方(サイズ制限)
- [ ] にこれぽ
  - [ ] 通知登録済みの動画をグレーアウト(not hover)
- [ ] オプション
  - [ ] インポート
  - [ ] 通知表示
- [ ] 通知
  - [ ] ？登録された通知が見つかりませんでした
  - [ ] 共通化
    - 区分けごとに処理を作成
    - 必要な処理はinterface
    - 処理をまとめて運用するmain的な関数を利用
    - 別区分と同じ処理を動かしても良いようにする
  - [ ] 昇順降順の切り替え
  - [ ] 動画が削除などされた際の対応
  - [ ] 全体新着確認
  - [ ] 通知の投稿者対応
  - [ ] 通知一覧のグループタグ機能
    - [ ] 最小化

# HamNicoVideo
## 機能一覧(2022/10/07)
- マイページ画面
  - 後で見るボタン追加
  - 種類別非表示フィルター
  - 左サイドバーの最小化
  - 種類別ハイライト
  - 新着対象時間(赤文字にする時間)変更
  - 表示アイテム小型化
- 視聴画面
  - 後で見るを表示するリンク追加
  - いいねボタン大きさ変更
  - 後で見るから削除ボタン追加
  - 1クリックマイリスト
- 通知ポップアップ
  - 通知可能対象
    - シリーズ
    - 投稿動画(未実装)
    - タグ(未実装)
  - 通知件数表示
  - 通知ハイライト
  - 前後動画遷移
  - 動画クリック時既読+次動画
  - 新着確認

## FAQ
- Q. 対応ブラウザ  
A. Chromeのみ(firefoxは0.6.2まで)
- Q. 機能案や不具合を報告したい  
A. 連絡手段は下記の通り
  - [Twitter](https://twitter.com/hukihamu)
  - [GitHub Issue](https://github.com/hukihamu/HamNicoVideo/issues)
  - [NicoNico](https://www.nicovideo.jp/user/26267653) (たまに生放送をやっています)


## 利用API(2022/01/28)
- https://nvapi.nicovideo.jp/v3/users/4846395/videos?sortKey=registeredAt&sortOrder=desc&pageSize=100&page=1
- https://nvapi.nicovideo.jp/v1/playlist/search?sortKey=registeredAt&sortOrder=desc&tag=d%E3%82%A2%E3%83%8B%E3%83%A1%E3%82%B9%E3%83%88%E3%82%A2&pageSize=32&page=1
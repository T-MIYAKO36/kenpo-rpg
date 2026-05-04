# 憲法学習RPG（GitHub Pages配信用）

中学社会の憲法学習向けビジュアルノベルRPG。ロイロノートのWebカードから生徒が同時アクセスする想定で、画像をWebP化・preloadタグ追加済み。

## アップロード手順

1. GitHubで新規 **Public** リポジトリを作成（例：`kenpo-rpg`）
2. このフォルダ（`kenpo_rpg_github`）の **中身** を全部アップロード
   - `index.html` をリポジトリのルート直下に置く
   - `images/` フォルダと `bgm_walk.mp3` も同じ階層
3. リポジトリの **Settings → Pages**
   - Source: `Deploy from a branch`
   - Branch: `main` / `/(root)`
4. 数分待つと公開URLが発行される
   - `https://<ユーザー名>.github.io/kenpo-rpg/`
5. このURLをロイロのWebカードに貼って配布

## 公開後の動作チェックリスト

- [ ] トップ画面が表示される（背景：bg_prologue）
- [ ] キャラクター画像の透過が保たれている（白背景が出ない）
- [ ] BGM「ゆったりお散歩」が再生される（クリック後）
- [ ] 各シーンの背景が切り替わる
- [ ] 卒業テスト画面が表示される
- [ ] エンディング背景・noriko_resolved/clear が表示される

## ファイル構成

```
kenpo_rpg_github/
├── index.html          ... ゲーム本体（kenpo_rpg_v2.htmlから画像参照のみ書き換え）
├── bgm_walk.mp3        ... BGM（旧「ゆったりお散歩.mp3」）
├── README.md
└── images/
    ├── kenpoukun.webp 他キャラ・コミック・UI 16枚（透過WebP・最大幅600px）
    └── bg/             ... 背景JPG 10枚（品質80・JPEG最適化）
```

## 容量

| 内訳            | 元    | 変換後 | 削減率 |
|-----------------|-------|--------|--------|
| キャラPNG×16    | 7.2MB | 0.5MB  | 93%    |
| 背景JPG×10      | 1.6MB | 1.2MB  | 25%    |
| HTML            | 1.1MB | 1.1MB  | 同等   |
| BGM mp3         | 4.5MB | 4.5MB  | 同等   |
| **合計**        | 14MB  | 7.0MB  | 50%    |

※ キャラ画像が小さくなったので、初回ロードは大幅に高速化されます。BGMはクリック後に再生開始のため、初期ロードには含まれません。

## 変更点（オリジナル `kenpo_rpg_v2.html` との差分）

1. 16枚のPNGキャラ画像参照（`.png` → `.webp`）
2. `images/卒業テスト.png` → `images/graduation_test.webp`（英語ファイル名化）
3. `./ゆったりお散歩.mp3` → `./bgm_walk.mp3`（英語ファイル名化）
4. `<head>` 末尾に5枚のpreloadタグを追加（同時アクセス時のロード分散）

JavaScriptロジック・スタイル・テキストには一切手を加えていません。

## トラブル時

- 画像が出ない: GitHub Actions のビルドが失敗していないか **Actions タブ** を確認
- 一部だけ表示されない: ブラウザのDevTools（F12）→ Network タブで404を確認
- 全員が同時に重い: GitHub Pagesの帯域は十分だが、生徒のWi-Fi側がボトルネックの可能性

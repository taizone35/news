---
name: neta-trend-daily
description: "トレンドネタ収集"
---

# トレンドネタ収集

有名サイトやはてなブックマークIT人気エントリーとHacker Newsの人気記事を収集し、過去にピックアップした記事は除外した上で、`ideas/daily/YYYYMMDD-trend.md` に保存する。
アクセスエラーとなったサイトは、次回以降もアクセスエラーになる可能性が高いため、除外理由を記載し、リストから除外する。

## 実行手順

### 0. ユーザープロファイル読み込み

`CLAUDE.md` を読み込み、以下の興味領域を理解する：
- AI（開発とセキュリティへの応用）
- Webセキュリティ/ハッキング（OWASP、脆弱性、サプライチェーン攻撃）
- OSS開発/コミュニティ
- 個人開発/SaaS運営（Technical SEO、グロースハック、収益化）
- キャリア/人生哲学（経済的自由、外資転職、Build in Public）
- JavaScript/TypeScript技術スタック

### 1. トレンド情報の収集

以下のサイトから最新のトレンド情報を取得：
**国関連**
- https://www.cao.go.jp/press/houdou.html
- https://www.meti.go.jp/press/index.html
- https://www.soumu.go.jp/menu_kyotsuu/whatsnew/index.html
- https://www.kantei.go.jp/jp/tyoukanpress/index.html

**X関連（参考情報）**
- 以下のアカウントの最新投稿を **WebSearch** で把握する（例: 「@mr_grayhair site:x.com 2026年4月」）
- [@mr_grayhair](https://x.com/mr_grayhair)
- [@horiemon_cross](https://x.com/horiemon_cross)
- [@takapon_jp](https://x.com/takapon_jp)
- [@digital_jpn](https://x.com/digital_jpn)
- **注意**: X は個別投稿 URL を正確に取得できないため、URL はアカウントページ (`https://x.com/アカウント名`) で代替してよい。投稿内容の概要が把握できればよい

**リサーチ**
- みずほリサーチ&テクノロジーズ: **WebSearch**で「みずほリサーチ&テクノロジーズ 最新レポート site:mizuho-rt.co.jp」を検索して取得（WAFでWebFetch/curl不可）
- https://www.jri.co.jp/report/ - **Playwrightスクリプト**で取得: `node .claude/skills/neta-trend-daily/scripts/fetch-js-sites.mjs --site jri`
- https://goodway.co.jp/news - **RSSフィード**で取得: `curl https://goodway.co.jp/news/feed`
- https://www.murc.jp/news/news_release/ - **Playwrightスクリプト**で取得: `node .claude/skills/neta-trend-daily/scripts/fetch-js-sites.mjs --site murc`
- https://onecapital.jp/explore-content - **Playwrightスクリプト**で取得: `node .claude/skills/neta-trend-daily/scripts/fetch-js-sites.mjs --site onecapital` (B2B SaaS/AI特化VCのPerspectives記事と投資先News)
- https://www.abeam.com/jp/ja/news/ - **WebFetch**で取得 (アビームコンサルティングのプレスリリース、AI/FinTech/自治体/SAP 関連話題)
- https://qiita.com/
- https://prtimes.jp/main/html/newarrival
- https://researchmap.jp/press_releases/press_releases/index.xml
- https://www.ivs.events/news
- https://morningpitch.com/news/

**日本市場（はてブIT）**
- https://b.hatena.ne.jp/hotentry/it
- https://b.hatena.ne.jp/hotentry/it/%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0
- https://b.hatena.ne.jp/hotentry/it/AI%E3%83%BB%E6%A9%9F%E6%A2%B0%E5%AD%A6%E7%BF%92
- https://b.hatena.ne.jp/hotentry/it/%E3%81%AF%E3%81%A6%E3%81%AA%E3%83%96%E3%83%AD%E3%82%B0%EF%BC%88%E3%83%86%E3%82%AF%E3%83%8E%E3%83%AD%E3%82%B8%E3%83%BC%EF%BC%89
- https://b.hatena.ne.jp/hotentry/it/%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E6%8A%80%E8%A1%93
- https://b.hatena.ne.jp/hotentry/it/%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%8B%E3%82%A2
- 各エントリーの**タイトル、元記事URL、ブックマーク数**を必ず取得すること
- はてブのエントリーページURLではなく、リンク先の元記事URLを抽出

**グローバル（Hacker News）**
- https://news.ycombinator.com/
- 各記事の**タイトル、HNコメントページURL（`https://news.ycombinator.com/item?id=XXXXX`形式）、ポイント数**を取得
- **元記事URLではなくHNのコメントページURLを使用すること**（コメントも確認できるようにするため）
- **タイトルは日本語に翻訳して出力**

**グローバル（News）**
- https://techcrunch.com/
- https://www.theverge.com/tech
- https://boringcashcow.com/report
- https://boringcashcow.com/interview
- https://www.indiehackers.com
- https://bootstrappers.com
- https://blog.hubspot.com/trends
- https://www.tinystartups.com
- https://microsaashq.com
- https://www.producthunt.com
- https://www.crunchbase.com
- https://www.kickstarter.com/?lang=ja
- 各記事の**タイトル、元記事URL**を取得
- **タイトルは日本語に翻訳して出力**

**セキュリティ（追加ソース）**
- https://www.aikido.dev/blog - セキュリティ研究開発者向けのセキュリティ情報
- https://www.wiz.io/blog - クラウドセキュリティ
- 最新1-3記事をチェックし、興味度★★★のものがあれば注目トピックに含める

**Reddit（13サブレッド）**
- **重要**: WebFetchツールはreddit.comをブロックするため、**Bashツールでcurlコマンドを使用**すること
- 各サブレッドから `/hot.json?t=day&limit=10` で上位10件を取得
- **old.reddit.com**を使用（www.reddit.comではない）
- User-Agentヘッダーを設定: `"User-Agent: neta-trend-collector/1.0 (trend analysis tool)"`
- 各記事の**タイトル、Redditコメントページの完全URL、投票数（ups）、コメント数**を取得
- **タイトルは日本語に翻訳して出力**

取得例（Bashツールで実行）:
```bash
curl -s -H "User-Agent: neta-trend-collector/1.0 (trend analysis tool)" \
  "https://old.reddit.com/r/programming/hot.json?t=day&limit=10" | \
  jq -r '.data.children[] | "\(.data.title)|\(.data.ups)|\(.data.num_comments)|https://www.reddit.com\(.data.permalink)"'
```

データ構造:
- `data.children[].data.title`: タイトル
- `data.children[].data.ups`: 投票数
- `data.children[].data.num_comments`: コメント数
- `data.children[].data.permalink`: パス（`https://www.reddit.com` + permalink で完全URL）

セキュリティ系（2サブレッド）:
- r/netsec
- r/cybersecurity

AI系（3サブレッド）:
- r/OpenAI
- r/LocalLLaMA
- r/ClaudeCode

コア技術系（2サブレッド）:
- r/programming
- r/technology

OSS/個人開発系（4サブレッド）:
- r/opensource
- r/indiehackers
- r/webdev
- r/javascript

キャリア/実践系（2サブレッド）:
- r/cscareerquestions
- r/productivity

### 2. 分析

収集した情報を以下の観点で分析：

**興味領域マッチング（最優先）**
- 各記事を興味領域と照合し、関連度を評価
- 高関連度の記事を「注目トピック」の最上位に配置
- 特に注目すべきトピック：
  - AI関連（開発ツール、セキュリティ、倫理）
  - セキュリティ関連（脆弱性、攻撃手法、防御策）
  - OSS/個人開発関連（成功事例、マーケティング、収益化）
  - 金融関連（経済動向、投資、暗号資産、銀行）
  - キャリア関連（外資転職、リモートワーク、副業）
  - JavaScript/TypeScript関連（新技術、ツール、フレームワーク）

**はてブIT**
- 日本のエンジニアに刺さりやすい話題
- 議論を呼びそうなトピック
- 技術トレンド（AI、開発手法、ツール等）
- キャリア・働き方関連

**Hacker News**
- グローバルで話題の技術トレンド
- スタートアップ・プロダクト関連
- セキュリティ関連（脆弱性、攻撃手法、インシデント）
- 議論を呼んでいるトピック（ポイント数が高い）

**Reddit（13サブレッド）**
- セキュリティ系：最新の脅威、実践的な攻撃・防御手法
- AI系：OpenAI、ローカルLLM、Claude Code関連
- OSS/個人開発系：OSSプロジェクト、個人開発、Web開発
- キャリア/実践系：キャリア、生産性
- 投票数（ups）とコメント数でコミュニティの反応を評価
- 議論が活発なトピック（コメント数が多い）を優先

### 3. 出力

**まず「ネタ収集完了。」というメッセージを返してから、結果を `ideas/daily/YYYYMMDD-trend.md` に保存。**

### 4. コミット・プッシュ

保存後、`ideas/daily/YYYYMMDD-trend.md` を git で main ブランチにコミットし、 origin にプッシュする。

```bash
git add ideas/daily/YYYYMMDD-trend.md
git commit -m "Add: YYYY-MM-DD トレンドレポート収集"
git push origin main
```

コミットメッセージは日本語で統一する。

以下のフォーマットで出力：

```markdown
# トレンドネタ: YYYY-MM-DD

## はてブIT（日本市場）

### 注目トピック

| タイトル | ブクマ数 | 興味度 | カテゴリ | メモ |
|---------|---------|--------|---------|------|
| [タイトル](元記事URL) | XXX users | ★★★/★★/★ | AI/開発/キャリア等 | 発信に活用できるポイント |

**興味度の定義**:
- ★★★: 興味領域に直接関連（AI×セキュリティ、OSS、個人開発、キャリア、金融など）
- ★★: 間接的に関連（技術トレンド全般、エンジニアリング文化）
- ★: 一般的なIT/技術ニュース

### 全エントリー

1. [タイトル](元記事URL) (XXX users) - 概要
2. ...

## Hacker News（グローバル）

### 注目トピック

| タイトル | ポイント | 興味度 | カテゴリ | メモ |
|---------|---------|--------|---------|------|
| [タイトル](HNコメントページURL) | XXXpt | ★★★/★★/★ | AI/Security/Dev等 | 発信に活用できるポイント |

### 全エントリー

1. [タイトル](HNコメントページURL) (XXXpt) - 概要
2. ...

## Reddit（13サブレッド）

### 注目トピック

| タイトル | 投票数 | コメント数 | 興味度 | カテゴリ | サブレッド | メモ |
|---------|--------|-----------|--------|---------|-----------|------|
| [タイトル](Redditコメントページ完全URL) | XXX ups | XXX | ★★★/★★/★ | Security/AI/OSS等 | r/subreddit | 発信に活用できるポイント |

### カテゴリ別エントリー

#### セキュリティ系
1. [タイトル](RedditコメントページURL) (XXX ups, XXX comments) - r/netsec - 概要
2. ...

#### AI系
1. [タイトル](RedditコメントページURL) (XXX ups, XXX comments) - r/OpenAI - 概要
2. ...

#### OSS/個人開発系
1. [タイトル](RedditコメントページURL) (XXX ups, XXX comments) - r/opensource - 概要
2. ...

#### キャリア/実践系
1. [タイトル](RedditコメントページURL) (XXX ups, XXX comments) - r/cscareerquestions - 概要
2. ...
```

## 注意事項

### タイトルの正確性（最重要）

- **タイトルはソースページに表示されている原文をそのまま転記すること。言い換え・要約・意訳は禁止**
  - 悪い例: 「絶対に押さないで！新入社員に贈る5選」（原文にない表現を創作）
  - 良い例: 「闇雲に使わないで！新入社員に知るべき新常識5つ！」（原文そのまま）
- **Hacker News・Reddit のタイトル翻訳では、原題に含まれない情報を追加してはならない**
  - 悪い例: 「Wacli -- WhatsApp CLI: 同期・検索・送信」（原題は "Wacli – WhatsApp CLI" のみ。機能説明を勝手に追加している）
  - 良い例: 「Wacli -- WhatsApp CLI」（原題の直訳のみ）
- **翻訳時は原題のトーン（皮肉、推量など）を保持すること**
  - 悪い例: 「すべての未来は嘘になる -- 新しい仕事の形」（"I Guess" の推量トーンが消失、"New Jobs" を意訳しすぎ）
  - 良い例: 「すべての未来は嘘、なのだろう: 新しい仕事」（原題 "The Future of Everything Is Lies, I Guess: New Jobs" に忠実）
- **サブエージェントに収集を委任する場合も、上記ルールをプロンプトに明記すること**

### URL の正確性

- WebFetchツールを使用して情報を取得
- **すべての記事にURLリンクを必ず含める（リンクなしは不可）**
- **はてブは元記事のURLを必ず取得**（はてブページURLではなく）
- **Hacker NewsはHNコメントページURL（`item?id=`形式）を使用**（元記事URLではなく）
- **RedditはRedditコメントページの完全URL（`https://www.reddit.com/r/subreddit/comments/...`形式）を使用**
- Reddit APIレート制限に注意（1分あたり60リクエスト程度）
- **個別記事の URL が取得できないソースは収集対象に含めないこと**。汎用 URL（アカウントトップページ、ニュース一覧ページなど）で代替してはならない

### その他

- 投票数（ups）/コメント数が高い記事を優先
- ポイント数/ブックマーク数が高い記事は特に注目
- 出力ファイルのYYYYMMDDは実行日の日付を使用
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
- 生成AI（開発ツール、倫理、社会的影響）
- 金融（経済動向、投資、暗号資産、銀行）
- Webセキュリティ/ハッキング（OWASP、脆弱性、サプライチェーン攻撃）
- OSS開発/コミュニティ
- 個人開発/SaaS運営（Technical SEO、グロースハック、収益化）
- キャリア/人生哲学（経済的自由、外資転職、Build in Public）
- JavaScript/TypeScript技術スタック

### 1. トレンド情報の収集

以下のサイトから最新のトレンド情報を取得：
**国関連**
- https://www.cao.go.jp/press/houdou.html - **RSSフィード**で取得: `curl https://www.cao.go.jp/rss/news.rdf` (内閣府 報道発表新着情報)
- https://www.meti.go.jp/press/index.html - **直接取得は全手段 (WebFetch / curl / Playwright) で接続遮断される**ため、次の 2 経路で代替する: (A) `mcp__Grok__search_x` で `allowed_x_handles=["meti_NIPPON"]` を指定し公式 X 投稿からリリース URL と公表事実を取得、 (B) WebSearch で個別リリースの二次解説記事を検索し本文の論点・数値を抽出。 Wayback Machine は METI をほぼアーカイブしないため当てにしない
- https://www.soumu.go.jp/menu_kyotsuu/whatsnew/index.html
- https://www.kantei.go.jp/jp/tyoukanpress/index.html
- https://www.fsa.go.jp/ - **RSSフィード**で取得: `curl https://www.fsa.go.jp/fsaNewsListAll_rss2.xml` (金融庁、金融行政・監督指針・行政処分・審議会等)
- https://www.fsa.go.jp/choutatu/choutatu_j/nyusatu_menu.html - **RSSフィード**で取得: `curl https://www.fsa.go.jp/fsaProcurementList_rss2.xml` (金融庁入札公告、機器購入など運用案件が大半のため、研究・調査委託系の案件のみ抽出して政策関心領域の兆候として扱う)
- https://www.jetro.go.jp/biznews.html - **RSSフィード**で取得: `curl https://www.jetro.go.jp/rss/biznews.xml` (ジェトロ ビジネス短信、海外ビジネスニュース)
- https://www.jetro.go.jp/biz/special.html - **RSSフィード**で取得: `curl https://www.jetro.go.jp/rss/areareports.xml` (ジェトロ 地域・分析レポート / 特集記事)
- https://www.cas.go.jp/topics.html - **WebFetch**で取得 (内閣官房新着情報、RSS なし。政府横断テーマの政策動向)

**X関連（参考情報）**
- 以下のアカウントの最新投稿は **必ず grok MCP** (`mcp__Grok__search_x`) を使って取得する。WebSearch は投稿本文の抜粋しか取れず、日付フィルタも効かないため X 収集には使用しない
- grok MCP が未接続 / 利用不可の場合は **収集を行わず**、出力レポートの X セクションに「grok MCP 未接続のため本日はスキップ」と明記するにとどめる (WebSearch でのフォールバックは禁止)
- 当リポジトリの grok MCP 実装では `search_posts` / `search_threads` は提供されていないため `search_x` を正とする。 `search_x` が使えないときに限り `mcp__Grok__ask` に `search=true` を付けてフォールバックして良いが、その旨を出力にも明記する
- 推奨呼び出し: `allowed_x_handles=["mr_grayhair"]` でアカウントを絞り、 `from_date` と `to_date` で直近 1 週間程度を指定する。検索できなかったアカウントは X セクションにその旨を明示 (例: 「直近 1 週間にヒットなし」)
- クエリ例: `query="AI セキュリティ キャリア の投稿"`, `allowed_x_handles=["mr_grayhair"]`, `from_date="YYYY-MM-DD"`, `to_date="YYYY-MM-DD"`
- 取得した個別投稿 URL は `https://x.com/i/status/...` 形式で得られることがあるため、本文に転記する際はそのまま残しても、アカウントトップで集約しても良い
- [@mr_grayhair](https://x.com/mr_grayhair)
- [@horiemon_cross](https://x.com/horiemon_cross)
- [@takapon_jp](https://x.com/takapon_jp)
- [@digital_jpn](https://x.com/digital_jpn)
- [@uemura_HR](https://x.com/@uemura_HR)
- [@ryoppippi](https://x.com/ryoppippi)
- [@mozumasu](https://x.com/mozumasu)
- [@go_kiritani](https://x.com/go_kiritani)
- **URL の扱い**: grok MCP `search_x` は `https://x.com/i/status/XXXXXX` 形式の個別投稿 URL を返す。この URL をそのまま転記すること。アカウントトップ URL (`https://x.com/アカウント名`) での代替は情報価値が下がるため禁止
- 当該期間に投稿がないアカウントは「直近 N 日の投稿なし」とだけ記載し、空の URL を作らないこと

**リサーチ**
- みずほリサーチ&テクノロジーズ: **WebSearch**で「みずほリサーチ&テクノロジーズ 最新レポート site:mizuho-rt.co.jp」を検索して取得（WAFでWebFetch/curl不可）
- https://www.jri.co.jp/report/ - **Playwrightスクリプト**で取得: `node .claude/skills/neta-trend-daily/scripts/fetch-js-sites.mjs --site jri`
- https://www.theverge.com/tech - **Playwrightスクリプト**で取得: `node .claude/skills/neta-trend-daily/scripts/fetch-js-sites.mjs --site theverge` (WebFetch ブロック済み、 Playwright では domcontentloaded + スクロール誘発で記事一覧が取れる)
- https://goodway.co.jp/news - **RSSフィード**で取得: `curl https://goodway.co.jp/news/feed`
- https://zenn.dev - **RSSフィード**で取得: `curl https://zenn.dev/feed` (Zenn トレンド全体、日本のエンジニア向け技術記事の人気トップ)
- https://zenn.dev/p/mkj - **RSSフィード**で取得: `curl https://zenn.dev/p/mkj/feed` (松尾研究所テックブログ、LLM 事後学習や Reasoning モデル等の AI 研究寄り記事)
- https://www.murc.jp/news/news_release/ - **Playwrightスクリプト**で取得: `node .claude/skills/neta-trend-daily/scripts/fetch-js-sites.mjs --site murc`
- https://onecapital.jp/explore-content - **Playwrightスクリプト**で取得: `node .claude/skills/neta-trend-daily/scripts/fetch-js-sites.mjs --site onecapital` (B2B SaaS/AI特化VCのPerspectives記事と投資先News)
- https://www.abeam.com/jp/ja/news/ - **WebFetch**で取得 (アビームコンサルティングのプレスリリース、AI/FinTech/自治体/SAP 関連話題)
- https://pitchbook.com/news - **Playwrightスクリプト**で取得: `node .claude/skills/neta-trend-daily/scripts/fetch-js-sites.mjs --site pitchbook` (VC/PE/M&A 動向、Cloudflare ボット対策あり curl/WebFetch 不可)
- https://www.wired.com/ - **Playwrightスクリプト**で取得: `node .claude/skills/neta-trend-daily/scripts/fetch-js-sites.mjs --site wired` (セキュリティ/AI/カルチャーの深掘り記事、WebFetch ブロックあり)
- https://www.techmeme.com/ - **WebFetch**で取得 (テック業界アグリゲーター、Bloomberg/WSJ/Wired/FT など取得困難サイトの記事を元記事 URL 付きで集約)
- https://qiita.com/
- https://prtimes.jp/main/html/newarrival
- https://researchmap.jp/press_releases/press_releases/index.xml
- https://www.ivs.events/news
- https://morningpitch.com/news/

**日本テック企業ブログ**
- https://blog.smartbank.co.jp - **RSSフィード**で取得: `curl https://blog.smartbank.co.jp/feed` (スマートバンク Tech Blog、AI 家計簿アプリ「ワンバンク」の開発運用知見。Ruby/Rails、プロダクト開発事例)
- https://techblog.lycorp.co.jp/ja - **RSSフィード**で取得: `curl https://techblog.lycorp.co.jp/ja/feed/index.xml` (LINE ヤフー Tech Blog、大規模インフラ・AI/MCP・データ基盤・アプリ開発の実例)
- https://goodpatch.com/blog - **RSSフィード**で取得: `curl https://goodpatch.com/blog/feed` (Goodpatch Blog、UI/UX デザイン・プロダクトデザイン・組織デザイン知見)

**PM / 個人ブログ**
- https://pm-ai-insights.com - **RSSフィード**で取得: `curl https://pm-ai-insights.com/feed/` (PM x LLM STUDIO、現役 PdM による PM × 生成 AI 活用発信。更新頻度は低めで直近数ヶ月分まとめて確認)
- https://blog.takaumada.com - **RSSフィード**で取得: `curl https://blog.takaumada.com/feed` (田所雅之氏ブログ、スタートアップ・起業論)

**金融専門メディア**
- https://www.nikkinonline.com - **WebFetch**で取得 (ニッキン ONLINE、日本金融通信社の銀行・信金・保険業界ニュース。RSS 提供なし、トップページから日次で掲載本数を確認)
- https://www.ncblibrary.com - **WebFetch**で取得 (NCB Library、金融・決済業界の解説メディア。RSS 提供なし)

**シンクタンク (追加)**
- https://www.mri.co.jp/news/index.html - **WebFetch** (Chrome 相当の User-Agent 必須) で取得 (三菱総合研究所 ニュース一覧、CloudFront ボット対策あり curl 既定 UA では 404 を返すため注意。プレスリリース・事業受託・協業発表)

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

### 3.1. README.md 同期 (GitHub トップページ表示用)

最新レポートをリポジトリトップに表示するため、 `ideas/daily/YYYYMMDD-trend.md` の内容を `README.md` にも反映する。 `README.md` は先頭の固定ヘッダー (プロジェクト概要 + 最新レポートへの案内 + `---` 区切り) に続けて、当日のレポート本文をそのまま連結する。

```bash
{
  cat <<'EOF'
# news -- トレンドネタ日次レポート

本リポジトリは、有名サイト・はてブ IT 人気エントリー・Hacker News・Reddit 13 サブレッドなどから日次のトレンドを収集し、興味領域と突き合わせてサマリ付きで公開するものです。

- 日次レポート本体: [ideas/daily/](ideas/daily)
- 収集スキル: [.claude/skills/neta-trend-daily/SKILL.md](.claude/skills/neta-trend-daily/SKILL.md)

以下は**最新日のレポートを常時コピーして表示**するセクションです ( 自動同期 ) 。

---

EOF
  cat ideas/daily/YYYYMMDD-trend.md
} > README.md
```

README.md はスキル実行のたびに上書きされるので、ヘッダー以外の手編集は避ける。

### 4. コミット・プッシュ

保存後、 `ideas/daily/YYYYMMDD-trend.md` と `README.md` の両方を git で main ブランチにコミットし、 origin にプッシュする。

```bash
git add ideas/daily/YYYYMMDD-trend.md README.md
git commit -m "Add: YYYY-MM-DD トレンドレポート収集"
git push origin main
```

コミットメッセージは日本語で統一する。

以下のフォーマットで出力：

**サマリの必須化**: 全てのエントリー（注目トピック・全エントリー両方）で、2-3 文のサマリを必ず記載する。サマリは以下の要素を含める：

- **何が起きたか / 何の記事か** (事実ベース)
- **なぜ注目すべきか / 論点は何か** (論点・示唆)

**サマリは必ず日本語で記述すること**。ソースが英語 (Hacker News / Reddit / Wired / PitchBook / Techmeme など) の場合も、英語原文をそのままコピーせず、日本語に翻訳・要約して記載する。原文の英語単語を括弧で補足するのは可 (例: 「ディストレスト (債務不履行間近) レバレッジドローン」)。

### サマリ作成の原則 (最重要)

- **必ず記事本文を取得・読解してサマリを書くこと**。タイトルだけからサマリを類推することは禁止。
- 具体的には、各エントリーの元記事 URL (はてブは元記事 URL、Hacker News は HN コメントページ、Reddit はコメントページ) に対して WebFetch を実行し、本文を読んだ上でサマリを作成する。
- Hacker News / Reddit の場合は、記事本文に加えて**コメントで議論されている論点**も可能な範囲でサマリに反映する (「コミュニティは X を議論」のような記述)。
- WebFetch に失敗した (403 / 401 / タイムアウト等) 場合に限り、末尾に `(本文未取得、タイトルからの推測)` と明記した上で推測ベースのサマリを書く。取得試行せずに推測で書いてはならない。
- 収集対象が多いときは WebFetch を並列実行して効率化する (1 メッセージ内で複数 WebFetch 呼び出しを発行)。
- **Reddit コメントページは WebFetch で必ず失敗する** ( Claude Code 側のドメインブロック、 `"Claude Code is unable to fetch from www.reddit.com"` エラーを返す。 `old.reddit.com` も同様 )。 Reddit の本文 / コメントを読む際は WebFetch を試さず、最初から `curl + jq` で Reddit JSON API を叩くこと。

Reddit 本文 + 上位コメント取得の定番コマンド:

```bash
curl -s -H "User-Agent: neta-trend-collector/1.0 (trend analysis tool)" \
  "https://old.reddit.com/r/<subreddit>/comments/<id>/.json?limit=5" | \
  jq -r '.[0].data.children[0].data.selftext as $post |
         [.[1].data.children[]?.data | select(.body != null) | "- " + (.ups|tostring) + "ups: " + (.body | .[0:300])] |
         ["POST: " + ($post | .[0:500])] + .[0:3] | .[]'
```

- `.[0].data.children[0].data.selftext` が投稿本文 (空の場合は外部リンク投稿なので本文なし)
- `.[1].data.children[].data.body` が上位コメント ( `.ups` 降順で 3 件程度に絞る )
- URL は `www.reddit.com` / `old.reddit.com` どちらでも JSON を返すが、 API 的には `old.reddit.com` 推奨

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

1. [タイトル](元記事URL) (XXX users)
   - **サマリ**: 何が書かれているか (2-3 文)。何が主張されて、なぜ注目すべきか。
2. ...

## Hacker News（グローバル）

### 注目トピック

| タイトル | ポイント | 興味度 | カテゴリ | メモ |
|---------|---------|--------|---------|------|
| [タイトル](HNコメントページURL) | XXXpt | ★★★/★★/★ | AI/Security/Dev等 | 発信に活用できるポイント |

### 全エントリー

1. [原題](HNコメントページURL) (XXXpt)
   - **翻訳**: 日本語タイトル (原題に忠実な直訳)
   - **サマリ**: 記事の要点 (2-3 文)。HN コメントで論じられている論点も含める。
2. ...

## Reddit（13サブレッド）

### 注目トピック

| タイトル | 投票数 | コメント数 | 興味度 | カテゴリ | サブレッド | メモ |
|---------|--------|-----------|--------|---------|-----------|------|
| [タイトル](Redditコメントページ完全URL) | XXX ups | XXX | ★★★/★★/★ | Security/AI/OSS等 | r/subreddit | 発信に活用できるポイント |

### カテゴリ別エントリー

#### セキュリティ系
1. [原題](RedditコメントページURL) (XXX ups, XXX comments) - r/netsec
   - **翻訳**: 日本語タイトル
   - **サマリ**: 投稿の要点 (2-3 文)。Reddit のコメントで起きている議論の方向性も含める。
2. ...

#### AI系
(同上フォーマット)

#### OSS/個人開発系
(同上フォーマット)

#### キャリア/実践系
(同上フォーマット)
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
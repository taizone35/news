# 2026-04-19 Grok MCP 差し替え計画

## 背景

`grok-search-mcp` ( npm パッケージ `grok-search-mcp` ) は xAI の Live Search ( `/v1/chat/completions` の `search_parameters` ) を送信せず、 Grok モデルに自然言語で検索結果を生成させているのみで、返ってくる URL / Tweet ID / 日付がすべて架空であった。以下の観測で確認済み。

1. `from:mr_grayhair` → Tweet ID が `1234567890…1234567894` の連番で返る。
2. `web_fetch https://x.com/mr_grayhair` → `fetched_at: 2023-10-05` ( 現在 2026-04-19 )、プレースホルダ bio を返す。
3. `Claude Opus 4.7 Anthropic release` → 2024 年 3 月の Claude 3 Opus 情報しか返らず、 Live Search 未稼働を示す。

クレジットとエンドポイント権限 (Chat) はスクリーンショットで確認済みで、原因は MCP 実装側。

## 目的

`.mcp.json` を Live Search 対応の `guzus/grok-mcp` ( `uvx grok-mcp` ) に差し替え、 `/neta-trend-daily` スキルの X 投稿取得を実データで可能にする。

## 置き換え対象

- ファイル: `/Users/taizo/Documents/Claude/Projects/trend-news/.mcp.json`
- 変更前

  ```json
  {
    "mcpServers": {
      "grok-search": {
        "command": "npx",
        "args": ["-y", "grok-search-mcp"],
        "env": {
          "GROK_API_KEY": "${XAI_API_KEY}",
          "GROK_TIMEOUT": "45000",
          "GROK_MAX_RETRIES": "5"
        }
      }
    }
  }
  ```

- 変更後

  ```json
  {
    "mcpServers": {
      "grok": {
        "command": "uvx",
        "args": ["grok-mcp"],
        "env": {
          "XAI_API_KEY": "${XAI_API_KEY}"
        }
      }
    }
  }
  ```

変更点は以下の通り。

1. サーバー名を `grok-search` から `grok` に変更。公式 README 記載の名前に合わせる。
2. 起動を `npx grok-search-mcp` から `uvx grok-mcp` へ変更。
3. 環境変数を `GROK_API_KEY` ( grok-search-mcp 専用 ) から `XAI_API_KEY` ( guzus/grok-mcp 規約 ) に変更。
4. `GROK_TIMEOUT` `GROK_MAX_RETRIES` は guzus/grok-mcp では未使用のため削除。

## 公開ツールの差分

| 用途 | 旧 (grok-search-mcp) | 新 (guzus/grok-mcp) |
| --- | --- | --- |
| X 投稿検索 | `mcp__grok-search__web_search` (platform=Twitter) | `mcp__grok__search_posts` (handles 指定可) |
| X ユーザー検索 | なし | `mcp__grok__search_users` |
| スレッド検索 | なし | `mcp__grok__search_threads` |
| トレンド | なし | `mcp__grok__get_trends` |
| 疎通確認 | `mcp__grok-search__get_config_info` | `mcp__grok__health_check` |
| Web fetch | `mcp__grok-search__web_fetch` | なし |
| Web 汎用検索 | `mcp__grok-search__web_search` | なし (X 専用) |

`web_fetch` と汎用 `web_search` を失うが、どちらも既存の Claude 組込 `WebFetch` `WebSearch` で代替可能。 `/neta-trend-daily` スキルで grok-search を使っていたのは X セクションのみなので、影響は限定的。

## 検証手順

差し替え後、新しい MCP が正しく Live Search を叩いているかを以下で判定する。

1. Claude Code セッションを再起動し、 `mcp__grok__health_check` で疎通を確認する。
2. `mcp__grok__search_posts` に `handles: ["mr_grayhair"]` を指定して最新 5 件を取得する。
   - 合格条件
     - 返却 URL の Tweet ID が 19 桁前後の実在 ID である ( `1234567890` のような 10 桁連番ではない )。
     - 投稿日時が 2026 年付近である。
     - 本文が日本語または英語で、実在アカウントの内容と整合する。
   - 不合格時はロールバックして原因を再調査する。
3. `@horiemon_cross` `@takapon_jp` `@digital_jpn` でも同様に確認する。

## /neta-trend-daily スキルへの反映

`neta-trend-daily/SKILL.md` 内の X 関連記述を新ツール名 ( `mcp__grok__search_posts` ) に置き換える。具体的には以下の節。

- 「X 関連 ( 参考情報 )」セクションの `mcp__grok-search__web_search` 参照 2 箇所。

ツール呼び出し例を以下に差し替える。

```
mcp__grok__search_posts(handles=["mr_grayhair"], limit=10)
```

## 影響範囲

- `.mcp.json` (差し替え)
- `.claude/skills/neta-trend-daily/SKILL.md` (ツール名更新)
- `ideas/daily/20260419-trend.md` ( X セクション追記。検証合格後に実施 )

## ロールバック手順

検証不合格または問題発生時は `.mcp.json` を git で直前版に戻す。

```
git checkout -- .mcp.json .claude/skills/neta-trend-daily/SKILL.md
```

## 実行順序

1. `.mcp.json` を差し替える。
2. Claude Code セッションを再起動 ( ユーザー操作 )。
3. `health_check` → `search_posts` の順に検証する。
4. `SKILL.md` を更新する。
5. `ideas/daily/20260419-trend.md` に X セクションを追記する。
6. 変更を git に日本語コミットメッセージでコミットし、 origin/main にプッシュする。

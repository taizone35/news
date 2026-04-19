# 2026-04-19 grok-search MCP サーバー追加計画

## 背景

WebFetch では Kickstarter などの bot 遮断サイトから 403 エラーが返り情報を取得できない。プロジェクト規約 (`Claud.md`) にも grok-search 最優先の指示があるため、grok 経由の Live Search を使える MCP サーバーを常備したい。

## 提案

### 採用パッケージ

`stat-guy/grok-search-mcp` (npx 起動、web + news + X 検索ツール付属)。

### スコープ

プロジェクト `.mcp.json` として trend-news 直下に配置し、チーム共有可能な形で git 管理する。

### 追加するファイル

`/Users/taizo/Documents/Claude/Projects/trend-news/.mcp.json` を新規作成する。

```json
{
  "mcpServers": {
    "grok-search": {
      "command": "npx",
      "args": ["-y", "grok-search-mcp"],
      "env": {
        "XAI_API_KEY": "${XAI_API_KEY}",
        "GROK_TIMEOUT": "45000",
        "GROK_MAX_RETRIES": "5"
      }
    }
  }
}
```

### API キー管理

XAI_API_KEY は環境変数参照とし、`.mcp.json` には鍵を直書きしない。ユーザー側で `.zshrc` などに `export XAI_API_KEY=...` を追記する想定。

### 動作確認

設定後、`claude mcp list` で `grok-search` が表示されることを確認する。Claude Code の再起動が必要な場合は案内する。

## 実行手順

1. プロジェクト直下に `.mcp.json` を作成する。
2. `claude mcp list` で認識を確認する。
3. `.zshrc` に `XAI_API_KEY` 設定を追記するよう案内する。

## 影響範囲

- `.mcp.json` が新規追加される。git 追跡対象になる。
- 既存の MCP サーバー設定には影響しない (別ファイル扱い)。
- `grok-search` を初回使用する際に npx がパッケージをダウンロードする。

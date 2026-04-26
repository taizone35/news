# Repository Guidelines

## Project Structure & Module Organization
This repository is a content pipeline for daily trend reports rather than an application codebase. Main outputs live in `ideas/daily/` as date-stamped Markdown files such as `ideas/daily/20260424-trend.md`. Repository-level guidance and the published latest report are in `README.md`. Claude automation rules and collection skills live under `.claude/`, especially `.claude/skills/neta-trend-daily/SKILL.md`. Prompt artifacts belong in `.prompts/`.

## Build, Test, and Development Commands
Install dependencies with `npm install`. The only declared runtime dependency is Playwright, used by the collection workflow for JS-heavy sites. There is no production build step. Use `node .claude/skills/neta-trend-daily/scripts/fetch-js-sites.mjs --site <name>` when extending or debugging site fetchers referenced by the skill. `npm test` currently fails by design and should not be treated as a real validation step until a test suite is added.

## Coding Style & Naming Conventions
Write documentation in Japanese unless a task explicitly requires another language. Keep Markdown concise, formal, and specific. Use spaces between half-width and full-width text, and avoid full-width colons and brackets per `.claude/rules/codex-guidelines.md`. Name daily reports as `YYYYMMDD-trend.md`. For new scripts, prefer descriptive lowercase file names and keep repository automation under `.claude/skills/` or a clearly named helper directory.

## Testing Guidelines
There is no automated test framework configured yet. Validate changes by checking the generated Markdown structure, links, and any affected fetch commands manually. When adding executable code, include a runnable verification path and avoid replacing broken tests with looser assertions. If a new test suite is introduced, document the command in `package.json` and update this file.

## Commit & Pull Request Guidelines
Recent history uses short Japanese commit messages, often starting with `Add:` followed by the date or change summary, for example `Add: 2026-04-24 トレンドレポート収集`. Keep commits focused on one report update or one tooling change. PRs should state the source or workflow changed, list impacted paths such as `ideas/daily/` or `.claude/skills/`, and include sample output or screenshots only when UI or rendered formatting changed.

## Agent-Specific Notes
Do not overwrite unrelated user edits. Check `git status --short` before editing, especially because local Claude settings may already be dirty. If you update a daily report, keep `README.md` in sync when the workflow requires the latest report to appear on the repository front page.

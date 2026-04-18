#!/usr/bin/env node
/**
 * JSレンダリングが必要なサイトからニュースを取得するスクリプト
 * Usage: node scripts/fetch-js-sites.mjs [--site <name>] [--all] [--json]
 *
 * Playwright (Chromium headless) を使ってJSレンダリング後のDOMから記事を抽出する。
 * WebFetch/curlでは403やJS未実行で取得できないサイトに対応。
 */

import { chromium } from "playwright";

const SITES = {
  murc: {
    name: "三菱UFJリサーチ&コンサルティング",
    url: "https://www.murc.jp/news/news_release/",
    extract: async (page) => {
      await page.waitForSelector(".news-list, .post-list, article, .entry", {
        timeout: 15000,
      }).catch(() => {});
      // フォールバック: 少し待ってからDOMを取得
      await page.waitForTimeout(3000);
      return page.evaluate(() => {
        const items = [];
        const links = document.querySelectorAll(
          'a[href*="/news/news_release/"], .news-list a, article a, .entry a, .post a'
        );
        for (const a of links) {
          const title = a.textContent?.trim();
          const href = a.href;
          if (
            title &&
            title.length > 10 &&
            href &&
            !href.includes("javascript:") &&
            href !== window.location.href
          ) {
            items.push({ title, url: href });
          }
        }
        const seen = new Set();
        return items.filter((item) => {
          if (seen.has(item.url)) return false;
          seen.add(item.url);
          return true;
        }).slice(0, 10);
      });
    },
  },

  jri: {
    name: "日本総合研究所",
    url: "https://www.jri.co.jp/report/",
    extract: async (page) => {
      await page.waitForSelector("a", { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3000);
      return page.evaluate(() => {
        const items = [];
        const links = document.querySelectorAll("a");
        for (const a of links) {
          const title = a.textContent?.trim().replace(/\s+/g, " ");
          const href = a.href;
          if (
            title &&
            title.length > 15 &&
            title.length < 200 &&
            href &&
            !href.includes("javascript:") &&
            !title.includes("一覧を見る") &&
            // 個別レポートのリンクのみ（detail/ or PDF or viewpoint/）
            (/\/detail\/\d+/.test(href) || /\/pdf\/\d+/.test(href) || /\/viewpoint\//.test(href))
          ) {
            items.push({ title, url: href });
          }
        }
        const seen = new Set();
        return items.filter((item) => {
          if (seen.has(item.url)) return false;
          seen.add(item.url);
          return true;
        }).slice(0, 10);
      });
    },
  },

  onecapital: {
    name: "One Capital (ExploreContent)",
    url: "https://onecapital.jp/explore-content",
    extract: async (page) => {
      await page.waitForSelector("a", { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3000);
      return page.evaluate(() => {
        const items = [];
        const links = document.querySelectorAll("a");
        for (const a of links) {
          const title = (a.innerText || a.textContent || "")
            .trim()
            .replace(/\s+/g, " ");
          const href = a.href;
          if (
            title &&
            title.length > 5 &&
            title.length < 200 &&
            href &&
            !href.includes("javascript:") &&
            // 個別記事のみ（perspectives/ or news/<slug>）
            (/\/perspectives\/[^/]+$/.test(href) ||
              /\/news\/[^/]+$/.test(href))
          ) {
            items.push({ title, url: href });
          }
        }
        const seen = new Set();
        return items.filter((item) => {
          if (seen.has(item.url)) return false;
          seen.add(item.url);
          return true;
        }).slice(0, 10);
      });
    },
  },
};

async function fetchSite(browser, siteKey) {
  const site = SITES[siteKey];
  if (!site) {
    console.error(`Unknown site: ${siteKey}`);
    return { site: siteKey, name: site?.name, items: [], error: "Unknown site" };
  }

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    locale: "ja-JP",
  });

  const page = await context.newPage();
  try {
    await page.goto(site.url, { waitUntil: "networkidle", timeout: 30000 });
    const items = await site.extract(page);
    return { site: siteKey, name: site.name, url: site.url, items };
  } catch (err) {
    return {
      site: siteKey,
      name: site.name,
      url: site.url,
      items: [],
      error: err.message,
    };
  } finally {
    await context.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");
  const allSites = args.includes("--all");
  const siteIndex = args.indexOf("--site");
  const specificSite = siteIndex >= 0 ? args[siteIndex + 1] : null;

  const siteKeys = allSites
    ? Object.keys(SITES)
    : specificSite
      ? [specificSite]
      : Object.keys(SITES);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const key of siteKeys) {
    const result = await fetchSite(browser, key);
    results.push(result);
  }

  await browser.close();

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    for (const result of results) {
      console.log(`\n=== ${result.name} (${result.url}) ===`);
      if (result.error) {
        console.log(`  ERROR: ${result.error}`);
      }
      if (result.items.length === 0) {
        console.log("  (記事が見つかりませんでした)");
      }
      for (const [i, item] of result.items.entries()) {
        console.log(`  ${i + 1}. [${item.title}](${item.url})`);
      }
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

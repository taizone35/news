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

  pitchbook: {
    name: "PitchBook News",
    url: "https://pitchbook.com/news",
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
            title.length > 10 &&
            title.length < 200 &&
            href &&
            !href.includes("javascript:") &&
            /\/news\/articles\/[^/]+$/.test(href)
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

  wired: {
    name: "Wired",
    url: "https://www.wired.com/",
    waitUntil: "domcontentloaded",
    timeout: 45000,
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
            title.length > 15 &&
            title.length < 200 &&
            href &&
            !href.includes("javascript:") &&
            // 記事URLは /story/<slug> または /story/<slug>/ 形式
            /\/story\/[^/]+\/?$/.test(href)
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

  theverge: {
    name: "The Verge Tech",
    url: "https://www.theverge.com/tech",
    waitUntil: "domcontentloaded",
    timeout: 45000,
    extract: async (page) => {
      await page.waitForTimeout(5000);
      // 遅延ロードを発火させるため最下部までスクロール
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let y = 0;
          const step = () => {
            window.scrollBy(0, 800);
            y += 800;
            if (y < document.body.scrollHeight) {
              setTimeout(step, 150);
            } else {
              resolve();
            }
          };
          step();
        });
      });
      await page.waitForTimeout(2000);
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
            title.length > 15 &&
            title.length < 200 &&
            href &&
            !href.includes("javascript:") &&
            // The Verge の現行記事 URL は /<category>/<id>/<slug> または直下 /<id>/<slug>
            /theverge\.com\/[a-z0-9-]+\/\d{6,}\//.test(href)
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

  // みずほリサーチ&テクノロジーズ (www.mizuho-rt.co.jp): WebFetch / Playwright いずれも
  // 403 Access Denied が返る CDN 硬ブロックを確認。自動化対象から外し、
  // PDF 直 URL や RSS 経由の収集に切り替える運用とする
  ncb_library: {
    name: "NCB Library",
    url: "https://www.ncblibrary.com/",
    waitUntil: "domcontentloaded",
    timeout: 45000,
    extract: async (page) => {
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
            title.length > 8 &&
            title.length < 200 &&
            href &&
            !href.includes("javascript:") &&
            // 個別投稿ページ /posts/NNNNNN
            /\/posts\/\d+$/.test(href)
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

  mri: {
    name: "三菱総合研究所",
    url: "https://www.mri.co.jp/knowledge/opinion/",
    waitUntil: "domcontentloaded",
    timeout: 45000,
    extract: async (page) => {
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
            title.length > 10 &&
            title.length < 200 &&
            href &&
            !href.includes("javascript:") &&
            // 個別コラム: /knowledge/opinion/YYYY/YYYYMM_N.html 等
            /\/knowledge\/(opinion|column|insight)\/\d{4}\//.test(href)
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

  morningpitch: {
    name: "Morning Pitch",
    url: "https://morningpitch.com/news/",
    waitUntil: "domcontentloaded",
    timeout: 45000,
    extract: async (page) => {
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
            title.length > 8 &&
            title.length < 200 &&
            href &&
            !href.includes("javascript:") &&
            // 個別記事: morningpitch.com/NNNNN/ (5 桁の記事 ID)
            /morningpitch\.com\/\d{4,6}\/?$/.test(href)
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

  ivs: {
    name: "IVS (Infinity Ventures Summit)",
    url: "https://www.ivs.events/news",
    waitUntil: "domcontentloaded",
    timeout: 45000,
    extract: async (page) => {
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
            title.length > 8 &&
            title.length < 200 &&
            href &&
            !href.includes("javascript:") &&
            // 個別記事: ivs.events/news/YYYYMMDD または /news/YYYYMMDD-キーワード
            /ivs\.events\/news\/\d{8}(-[a-z0-9-]+)?$/.test(href)
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

  // METI (www.meti.go.jp): curl / WebFetch / Playwright すべて接続段階で遮断され取得不可
  // 自動化対象から外し、 WebSearch 等で URL / タイトルのみを収集する運用とする
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
    await page.goto(site.url, {
      waitUntil: site.waitUntil || "networkidle",
      timeout: site.timeout || 30000,
    });
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

// scripts/pingAllSearchEngines.js

const fetch = global.fetch || require('node-fetch');
const xml2js = require('xml2js');
require('dotenv').config();

const apiKey = process.env.BING_API_KEY;
const siteUrl = process.env.SITE_URL;
const indexnowKey = process.env.INDEXNOW_KEY;

// List your sitemaps here
const sitemaps = [
  `${siteUrl}/sitemap.xml`,
  `${siteUrl}/blog/sitemap.xml`,
  `${siteUrl}/watch/sitemap.xml`,
];

// 1. Get all URLs from sitemaps (for Bing & IndexNow)
async function getUrlsFromSitemaps() {
  let urls = [];
  for (const sitemap of sitemaps) {
    try {
      const res = await fetch(sitemap);
      const xml = await res.text();
      const parsed = await xml2js.parseStringPromise(xml);
      const locs =
        parsed.urlset.url
          ?.map(u => u.loc[0])
          .filter(Boolean) || [];
      urls = urls.concat(locs);
    } catch (err) {
      console.error(`[Sitemap] Error fetching or parsing ${sitemap}:`, err);
    }
  }
  return Array.from(new Set(urls));
}

// 2. Submit URLs to Bing (with quota handling)
async function submitBing(urls) {
  const BING_DAILY_QUOTA = 8;
  const urlsToSubmit = urls.slice(0, BING_DAILY_QUOTA);
  const skippedUrls = urls.slice(BING_DAILY_QUOTA);

  if (urlsToSubmit.length === 0) {
    console.log('[Bing] No URLs to submit today (quota exhausted).');
    return;
  }

  try {
    const response = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ siteUrl, urlList: urlsToSubmit }),
      }
    );
    const data = await response.json();
    console.log(`\n[Bing] API Response for ${urlsToSubmit.length} URLs:`, data);

    if (skippedUrls.length > 0) {
      console.log(
        `[Bing] Skipped ${skippedUrls.length} URLs due to daily quota. They will not be submitted today:`,
        skippedUrls
      );
    }
  } catch (err) {
    console.error('[Bing] Submission Error:', err);
  }
}

// 3. Submit URLs to IndexNow
async function submitIndexNow(urls) {
  for (const url of urls) {
    try {
      const endpoint = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${indexnowKey}`;
      const response = await fetch(endpoint);
      if (response.ok) {
        console.log(`[IndexNow] Submitted: ${url} | Status: ${response.status}`);
      } else {
        console.log(`[IndexNow] Error: ${url} | Status: ${response.status}`);
      }
    } catch (err) {
      console.error('[IndexNow] Error:', err);
    }
  }
}

// 4. Ping Google and Yandex with sitemaps
async function pingSitemaps() {
  for (const sitemap of sitemaps) {
    // Google Ping
    try {
      const gURL = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`;
      const gRes = await fetch(gURL);
      console.log(`[Google] Sitemap ping: ${sitemap} | Status: ${gRes.status}`);
    } catch (err) {
      console.error('[Google] Sitemap ping error:', err);
    }

    // Yandex Ping
    try {
      const yURL = `https://yandex.com/indexnow?url=${encodeURIComponent(sitemap)}`;
      const yRes = await fetch(yURL);
      console.log(`[Yandex] Sitemap ping: ${sitemap} | Status: ${yRes.status}`);
    } catch (err) {
      console.error('[Yandex] Sitemap ping error:', err);
    }
  }
}

(async () => {
  const urls = await getUrlsFromSitemaps();

  if (urls.length === 0) {
    console.log('No URLs found in sitemaps.');
    return;
  }

  // Bing (batch, up to daily quota)
  await submitBing(urls);

  // IndexNow (individually)
  await submitIndexNow(urls);

  // Google & Yandex (sitemaps)
  await pingSitemaps();

  console.log('\n🚀 All pings complete! SEO bots are on their way.');
})();
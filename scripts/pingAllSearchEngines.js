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
    const res = await fetch(sitemap);
    const xml = await res.text();
    const parsed = await xml2js.parseStringPromise(xml);
    const locs =
      parsed.urlset.url
        ?.map(u => u.loc[0])
        .filter(Boolean) || [];
    urls = urls.concat(locs);
  }
  return Array.from(new Set(urls));
}

// 2. Submit URLs to Bing
async function submitBing(urls) {
  try {
    const response = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ siteUrl, urlList: urls }),
      }
    );
    const data = await response.json();
    console.log(`\n[Bing] API Response for ${urls.length} URLs:`, data);
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

  // Bing (batch)
  await submitBing(urls);

  // IndexNow (individually)
  await submitIndexNow(urls);

  // Google & Yandex (sitemaps)
  await pingSitemaps();

  console.log('\n🚀 All pings complete! SEO bots are on their way.');
})();
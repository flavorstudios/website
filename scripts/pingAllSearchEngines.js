// scripts/pingAllSearchEngines.js

const fetch = global.fetch || require('node-fetch');
const xml2js = require('xml2js');
require('dotenv').config();

const apiKey = process.env.BING_API_KEY;
const indexnowKey = process.env.INDEXNOW_KEY; // renamed for consistency

const siteUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
if (!siteUrl) {
  console.error("❌ siteUrl is undefined. Please set BASE_URL or NEXT_PUBLIC_BASE_URL in your .env file.");
  process.exit(1);
}

console.log(`🔗 Using site URL: ${siteUrl}`);

const sitemaps = [
  `${siteUrl}/sitemap.xml`,
  `${siteUrl}/blog/sitemap.xml`,
  `${siteUrl}/watch/sitemap.xml`,
];

// --- STEP 1: Fetch URLs from sitemaps ---
async function getUrlsFromSitemaps() {
  let urls = [];
  for (const sitemap of sitemaps) {
    try {
      const res = await fetch(sitemap);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const parsed = await xml2js.parseStringPromise(xml);
      const locs = parsed.urlset.url?.map(u => u.loc[0]).filter(Boolean) || [];
      urls = urls.concat(locs);
    } catch (err) {
      console.error(`[Sitemap] Error fetching or parsing ${sitemap}:`, err);
    }
  }

  // Deduplicate and sanitize
  const deduped = Array.from(new Set(urls));
  return deduped.filter(u => {
    try {
      new URL(u);
      return u.startsWith("http");
    } catch {
      return false;
    }
  });
}

// --- STEP 2: Submit URLs to Bing ---
async function submitBing(urls) {
  if (!apiKey) {
    console.log('[Bing] No API key set, skipping Bing submission.');
    return;
  }

  const BING_DAILY_QUOTA = 8;
  const urlsToSubmit = urls.slice(0, BING_DAILY_QUOTA);
  const skipped = urls.slice(BING_DAILY_QUOTA);

  if (urlsToSubmit.length === 0) {
    console.log('[Bing] No URLs to submit today (quota exhausted).');
    return;
  }

  try {
    const res = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ siteUrl, urlList: urlsToSubmit }),
    });
    const data = await res.json();
    console.log(`\n[Bing] Submitted ${urlsToSubmit.length} URLs:`, data);

    if (skipped.length > 0) {
      console.log(`[Bing] Skipped ${skipped.length} due to quota:`, skipped);
    }
  } catch (err) {
    console.error('[Bing] Submission Error:', err);
  }
}

// --- STEP 3: Submit to IndexNow individually ---
async function submitIndexNow(urls) {
  if (!indexnowKey) {
    console.log('[IndexNow] No API key set, skipping IndexNow submission.');
    return;
  }

  for (const url of urls) {
    try {
      const endpoint = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${indexnowKey}`;
      const res = await fetch(endpoint);
      const status = res.status;
      if (res.ok) {
        console.log(`[IndexNow] ✅ Submitted: ${url} | ${status}`);
      } else {
        console.warn(`[IndexNow] ❌ Failed: ${url} | ${status}`);
      }
    } catch (err) {
      console.error('[IndexNow] Error:', err);
    }
  }
}

// --- STEP 4: Ping Google & Yandex for sitemap discovery ---
async function pingSitemaps() {
  for (const sitemap of sitemaps) {
    const encoded = encodeURIComponent(sitemap);

    // Google
    try {
      const g = await fetch(`https://www.google.com/ping?sitemap=${encoded}`);
      console.log(`[Google] Pinged: ${sitemap} | ${g.status}`);
    } catch (err) {
      console.error('[Google] Ping error:', err);
    }

    // Yandex
    try {
      const y = await fetch(`https://yandex.com/ping?sitemap=${encoded}`);
      console.log(`[Yandex] Pinged: ${sitemap} | ${y.status}`);
    } catch (err) {
      console.error('[Yandex] Ping error:', err);
    }
  }
}

// --- RUN ALL ---
(async () => {
  const urls = await getUrlsFromSitemaps();

  if (urls.length === 0) {
    console.log('⚠️ No valid URLs found in sitemaps.');
    return;
  }

  await submitBing(urls);
  await submitIndexNow(urls);
  await pingSitemaps();

  console.log('\n🚀 All pings complete! SEO bots have been summoned.');
})();

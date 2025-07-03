// scripts/pingAllSearchEngines.js

const fetch = global.fetch || require('node-fetch');
const xml2js = require('xml2js');
require('dotenv').config();

const apiKey = process.env.BING_API_KEY;
const indexnowKey = process.env.INDEXNOW_KEY;
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

// --- Final URL Cleaner ---
function normalizeUrl(path) {
  try {
    const url = new URL(path);
    return url.href; // Already absolute (http/https)
  } catch {
    // If path already starts with siteUrl, don't double it
    if (path.startsWith(siteUrl)) {
      return path;
    }
    // Ensure leading slash
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return `${siteUrl}${cleanPath}`;
  }
}

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

  // Normalize + deduplicate
  const deduped = Array.from(new Set(urls));
  return deduped
    .map(normalizeUrl)
    .filter(u => {
      try {
        return u.startsWith("http") && Boolean(new URL(u));
      } catch {
        return false;
      }
    });
}

// --- STEP 2: Submit to Bing ---
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

// --- STEP 3: Submit to IndexNow ---
async function submitIndexNow(urls) {
  if (!indexnowKey) {
    console.log('[IndexNow] No API key set, skipping IndexNow submission.');
    return;
  }

  for (const url of urls) {
    try {
      const endpoint = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${indexnowKey}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        console.log(`[IndexNow] ✅ Submitted: ${url} | ${res.status}`);
      } else {
        console.warn(`[IndexNow] ❌ Failed: ${url} | ${res.status}`);
      }
    } catch (err) {
      console.error('[IndexNow] Error:', err);
    }
  }
}

// --- STEP 4: Ping Google & Yandex ---
async function pingSitemaps() {
  for (const sitemap of sitemaps) {
    const encoded = encodeURIComponent(sitemap);

    try {
      const g = await fetch(`https://www.google.com/ping?sitemap=${encoded}`);
      console.log(`[Google] Pinged: ${sitemap} | ${g.status}`);
    } catch (err) {
      console.error('[Google] Ping error:', err);
    }

    try {
      const y = await fetch(`https://yandex.com/ping?sitemap=${encoded}`);
      console.log(`[Yandex] Pinged: ${sitemap} | ${y.status}`);
    } catch (err) {
      console.error('[Yandex] Ping error:', err);
    }
  }
}

// --- RUN ---
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

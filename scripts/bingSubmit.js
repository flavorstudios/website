// scripts/bingSubmit.js

const fetch = global.fetch || require('node-fetch');
const xml2js = require('xml2js');
require('dotenv').config();

const apiKey = process.env.BING_API_KEY;
const siteUrl = process.env.SITE_URL;
const indexnowKey = process.env.INDEXNOW_KEY; // Add this to your .env file!

const sitemaps = [
  `${siteUrl}/sitemap.xml`,
  `${siteUrl}/blog/sitemap.xml`,
  `${siteUrl}/watch/sitemap.xml`,
];

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

// Submit URLs to Bing
async function submitBing(urls) {
  const response = await fetch(
    `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ siteUrl, urlList: urls }),
    }
  );
  const data = await response.json();
  console.log(`Bing API Response for ${urls.length} URLs:`, data);
}

// Submit URLs to IndexNow
async function submitIndexNow(urls) {
  for (const url of urls) {
    const endpoint = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${indexnowKey}`;
    const response = await fetch(endpoint);
    if (response.ok) {
      console.log(`IndexNow submitted: ${url} | Status: ${response.status}`);
    } else {
      console.log(`IndexNow error: ${url} | Status: ${response.status}`);
    }
  }
}

(async () => {
  const urls = await getUrlsFromSitemaps();
  if (urls.length === 0) {
    console.log('No URLs found in sitemaps.');
    return;
  }
  // Submit to Bing (batch)
  await submitBing(urls);

  // Submit to IndexNow (individually)
  await submitIndexNow(urls);
})();
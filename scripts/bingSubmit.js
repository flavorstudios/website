// scripts/bingSubmit.js

const fetch = global.fetch || require('node-fetch');
const xml2js = require('xml2js');

const apiKey = 'ce474216bfb24d0f917a231b1449414d'; // Bing Webmaster API key
const siteUrl = 'https://flavorstudios.in';

// List all your sitemaps here (add more as needed)
const sitemaps = [
  'https://flavorstudios.in/sitemap.xml',
  'https://flavorstudios.in/blog/sitemap.xml',
  'https://flavorstudios.in/watch/sitemap.xml',
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
  // Remove duplicates
  return Array.from(new Set(urls));
}

async function submitUrls(urls) {
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

(async () => {
  const urls = await getUrlsFromSitemaps();
  if (urls.length === 0) {
    console.log('No URLs found in sitemaps.');
    return;
  }
  // Bing's limit is 500 URLs per batch—split if needed:
  const batchSize = 500;
  for (let i = 0; i < urls.length; i += batchSize) {
    await submitUrls(urls.slice(i, i + batchSize));
  }
})();
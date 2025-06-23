const axios = require('axios');
const cheerio = require('cheerio');
const xml2js = require('xml2js');

const sitemapUrl = 'https://flavorstudios.in/sitemap.xml';

async function getUrlsFromSitemap() {
  try {
    const res = await axios.get(sitemapUrl);
    const parsed = await xml2js.parseStringPromise(res.data);
    const urls = parsed.urlset.url.map(u => u.loc[0]);
    return urls;
  } catch (err) {
    console.error('⚠️ Failed to fetch sitemap:', err.message);
    return [];
  }
}

async function checkIndexability(url) {
  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const robotsMeta = $('meta[name="robots"]').attr('content') || '';
    const lower = robotsMeta.toLowerCase();
    if (lower.includes('noindex')) {
      return { url, status: '❌ Not Indexable' };
    } else {
      return { url, status: '✅ Indexable' };
    }
  } catch (err) {
    return { url, status: `⚠️ Error: ${err.message}` };
  }
}

(async () => {
  const urls = await getUrlsFromSitemap();
  if (urls.length === 0) {
    console.error('No URLs found in sitemap.');
    return;
  }

  console.log(`🔍 Checking ${urls.length} pages...\n`);

  const results = await Promise.all(urls.map(checkIndexability));
  const indexable = results.filter(r => r.status === '✅ Indexable');
  const noindex = results.filter(r => r.status === '❌ Not Indexable');
  const errors = results.filter(r => r.status.startsWith('⚠️'));

  console.log('\n✅ Indexable Pages:');
  indexable.forEach(r => console.log(`- ${r.url}`));

  console.log('\n❌ Not Indexable Pages:');
  noindex.forEach(r => console.log(`- ${r.url}`));

  if (errors.length) {
    console.log('\n⚠️ Errors:');
    errors.forEach(r => console.log(`- ${r.url}: ${r.status}`));
  }
})();
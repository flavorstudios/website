import { parseStringPromise } from 'xml2js'; // Correct ES module import
import dotenv from 'dotenv'; // Correct ES module import
import { serverEnv } from '../env/server.js';

dotenv.config();

const apiKey = serverEnv.BING_API_KEY;
const indexnowKey = serverEnv.INDEXNOW_KEY;
let siteUrl = serverEnv.BASE_URL || serverEnv.NEXT_PUBLIC_BASE_URL;

if (!siteUrl) {
    console.error("❌ siteUrl is undefined. Please set BASE_URL or NEXT_PUBLIC_BASE_URL in your .env file.");
    process.exit(1);
}

// Remove trailing slash for consistency
siteUrl = siteUrl.replace(/\/+$/, "");
const siteUrlOrigin = new URL(siteUrl).origin; // Cache origin for comparison
const siteUrlHostname = new URL(siteUrl).hostname; // Cache hostname for comparison

console.log(`🔗 Using site URL: ${siteUrl}`);

const sitemaps = [
    `${siteUrl}/sitemap.xml`,
    `${siteUrl}/blog/sitemap.xml`,
    `${siteUrl}/watch/sitemap.xml`,
];

function normalizeUrl(urlPath) {
    if (!urlPath) return "";

    let cleanedUrl = String(urlPath).trim();

    if (cleanedUrl.startsWith(`${siteUrl}/`)) {
        const regex = new RegExp(`^${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/(${siteUrlHostname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|${siteUrlHostname.replace('www.', '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`);
        if (regex.test(cleanedUrl)) {
            cleanedUrl = cleanedUrl.replace(regex, siteUrl); // Replace the double part with just the single siteUrl
        }
    }
    else if (cleanedUrl.startsWith('/') && cleanedUrl.slice(1).startsWith(siteUrlHostname)) {
        cleanedUrl = siteUrl + cleanedUrl.slice(1 + siteUrlHostname.length);
    }

    try {
        const url = new URL(cleanedUrl);
        if (url.origin === siteUrlOrigin) {
            return url.href;
        } else {
            return url.href;
        }
    } catch {
        if (cleanedUrl && !cleanedUrl.startsWith('/')) {
            cleanedUrl = '/' + cleanedUrl;
        }
        return siteUrl + cleanedUrl;
    }
}

async function getUrlsFromSitemaps() {
    let urls = [];
    for (const sitemap of sitemaps) {
        try {
            const res = await fetch(sitemap);
            if (!res.ok) {
                console.warn(`[Sitemap] Warning: Could not fetch sitemap ${sitemap}. Status: ${res.status}`);
                continue;
            }
            const xml = await res.text();
            const parsed = await parseStringPromise(xml);
            const locs = parsed.urlset && parsed.urlset.url
                ? parsed.urlset.url.map(u => u.loc[0]).filter(Boolean)
                : [];

            console.log(`[DEBUG] Raw URLs from ${sitemap}:`, locs);

            urls = urls.concat(locs);
        } catch (err) {
            console.error(`[Sitemap] Error fetching or parsing ${sitemap}:`, err);
        }
    }

    const deduped = Array.from(new Set(urls));
    const normalizedUrls = deduped
        .map(normalizeUrl)
        .filter(u => {
            try {
                const urlObj = new URL(u);
                return urlObj.origin === siteUrlOrigin;
            } catch {
                return false;
            }
        });

    console.log(`[DEBUG] URLs after normalization and filtering:`, normalizedUrls);

    return normalizedUrls;
}

async function submitBing(urls) {
    if (!apiKey) {
        console.log('[Bing] No API key set, skipping Bing submission.');
        return;
    }

    const BING_DAILY_QUOTA = 5;
    const urlsToSubmit = urls.slice(0, BING_DAILY_QUOTA);
    const skipped = urls.slice(BING_DAILY_QUOTA);

    if (urlsToSubmit.length === 0) {
        console.log('[Bing] No URLs to submit today (quota exhausted or no URLs).');
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

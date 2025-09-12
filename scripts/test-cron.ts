import 'cross-fetch/polyfill';
import { BASE_URL, CRON_SECRET } from '../lib/env';

const secret = CRON_SECRET;
if (!secret) {
  console.error('CRON_SECRET is not set');
  process.exit(1);
}

const endpoints = [
  '/api/cron/revalidate',
  '/api/internal/build-sitemap',
  '/api/internal/build-rss',
  '/api/internal/analytics-rollup',
  '/api/internal/backup',
];

(async () => {
  for (const path of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = await res.json().catch(() => ({}));
      console.log(path, res.status, data);
    } catch (err) {
      console.error(path, err);
      console.error(`Ensure dev server is running at ${BASE_URL}`);
      process.exit(1);
    }
  }
})();
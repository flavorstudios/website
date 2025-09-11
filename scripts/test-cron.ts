const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'test-secret';

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
        headers: { Authorization: `Bearer ${CRON_SECRET}` },
      });
      const data = await res.json().catch(() => ({}));
      console.log(path, res.status, data);
    } catch (err) {
      console.error(path, err);
    }
  }
})();
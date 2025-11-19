import 'cross-fetch/polyfill';

const key = process.argv[2];
if (!key) {
  console.error('Usage: node scripts/probePost.js <key>');
  process.exit(1);
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'http://localhost:4000';
const url = `${BASE_URL.replace(/\/$/, '')}/posts/${encodeURIComponent(key)}`;

fetch(url)
  .then(async (res) => {
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(text.slice(0, 500));
  })
  .catch(() => {
    console.error(`Is the dev server running at ${BASE_URL}?`);
    process.exit(1);
  });
const key = process.argv[2];
if (!key) {
  console.error('Usage: node scripts/probePost.js <key>');
  process.exit(1);
}

const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const url = `${base}/api/blogs/${encodeURIComponent(key)}`;

fetch(url)
  .then(async (res) => {
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(text.slice(0, 500));
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
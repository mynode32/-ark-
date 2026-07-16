const base = (process.env.SMOKE_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
const checks = [
  ['/api/health', 'application/json'],
  ['/api/health/ready', 'application/json'],
  ['/mystore/', 'text/html'],
  ['/mystore/panel', 'text/html'],
  ['/dist/cark-widget.v1.js', 'javascript'],
];

let failed = false;
for (const [path, expectedType] of checks) {
  try {
    const response = await fetch(`${base}${path}`, { redirect: 'follow' });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes(expectedType)) {
      failed = true;
      console.error(`[Smoke] FAIL ${path}: ${response.status} ${contentType}`);
    } else {
      console.log(`[Smoke] OK ${path}: ${response.status}`);
    }
  } catch (error) {
    failed = true;
    console.error(`[Smoke] FAIL ${path}: ${error.message}`);
  }
}

const storeSlug = process.env.SMOKE_STORE_SLUG;
if (storeSlug) {
  const origin = process.env.SMOKE_STORE_ORIGIN || base;
  try {
    const response = await fetch(`${base}/api/widget/${encodeURIComponent(storeSlug)}/config`, {
      headers: { Origin: origin },
    });
    if (!response.ok) {
      failed = true;
      console.error(`[Smoke] FAIL widget ${storeSlug}: ${response.status}`);
    } else {
      const config = await response.json();
      if (!Array.isArray(config.segments) || config.segments.length !== 6) {
        failed = true;
        console.error(`[Smoke] FAIL widget ${storeSlug}: 6 dilim bulunamadı`);
      } else {
        console.log(`[Smoke] OK widget ${storeSlug}: 6 dilim`);
      }
    }
  } catch (error) {
    failed = true;
    console.error(`[Smoke] FAIL widget ${storeSlug}: ${error.message}`);
  }
}
if (failed) process.exitCode = 1;

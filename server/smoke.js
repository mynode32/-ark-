const base = (process.env.SMOKE_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
const checks = [
  ['/api/health', 'application/json'],
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
if (failed) process.exitCode = 1;

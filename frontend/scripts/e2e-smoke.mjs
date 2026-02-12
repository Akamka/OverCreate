import { spawn } from 'node:child_process';
import process from 'node:process';

const HOST = '127.0.0.1';
const PORT = 4010;
const BASE = `http://${HOST}:${PORT}`;
const STARTUP_TIMEOUT_MS = 120_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status >= 300) return;
    } catch {
      // keep polling
    }
    await sleep(1000);
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms`);
}

function assertTrue(condition, message) {
  if (!condition) throw new Error(message);
}

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}`);
  const text = await res.text();
  return { res, text };
}

const devCommand =
  process.platform === 'win32'
    ? `npm run dev -- --port ${PORT} --hostname ${HOST}`
    : `npm run dev -- --port ${PORT} --hostname ${HOST}`;

const nextProcess = spawn(devCommand, {
  env: process.env,
  stdio: 'pipe',
  shell: true,
});

nextProcess.stdout.on('data', (chunk) => {
  process.stdout.write(`[next] ${chunk}`);
});

nextProcess.stderr.on('data', (chunk) => {
  process.stderr.write(`[next:err] ${chunk}`);
});

async function run() {
  try {
    await waitForServer(`${BASE}/services`, STARTUP_TIMEOUT_MS);

    const checks = [
      '/services',
      '/services/web',
      '/insights',
      '/privacy-policy',
      '/login',
      '/test-portfolio',
      '/robots.txt',
      '/sitemap.xml',
    ];

    for (const path of checks) {
      const { res } = await fetchText(path);
      assertTrue(res.ok, `${path} expected HTTP 200, got ${res.status}`);
    }

    const servicesHtml = await fetchText('/services');
    assertTrue(servicesHtml.text.includes('rel="canonical"'), '/services missing canonical tag');

    const insightsHtml = await fetchText('/insights');
    assertTrue(insightsHtml.text.includes('rel="canonical"'), '/insights missing canonical tag');

    const loginHtml = await fetchText('/login');
    assertTrue(
      /<meta[^>]+name="robots"[^>]+noindex/i.test(loginHtml.text),
      '/login should contain noindex robots meta'
    );

    const testPortfolioHtml = await fetchText('/test-portfolio');
    assertTrue(
      /<meta[^>]+name="robots"[^>]+noindex/i.test(testPortfolioHtml.text),
      '/test-portfolio should contain noindex robots meta'
    );

    const robotsTxt = await fetchText('/robots.txt');
    assertTrue(robotsTxt.text.includes('Disallow: /test-portfolio'), 'robots.txt missing /test-portfolio disallow');
    assertTrue(robotsTxt.text.includes('Disallow: /projects/'), 'robots.txt missing /projects/ disallow');

    const sitemapXml = await fetchText('/sitemap.xml');
    assertTrue(sitemapXml.text.includes('/services'), 'sitemap missing /services');
    assertTrue(sitemapXml.text.includes('/insights'), 'sitemap missing /insights');

    console.log('\nE2E smoke checks passed.');
  } finally {
    if (!nextProcess.killed) {
      nextProcess.kill('SIGINT');
      await sleep(1000);
      if (!nextProcess.killed) nextProcess.kill('SIGTERM');
    }
  }
}

run().catch((err) => {
  console.error('\nE2E smoke checks failed:');
  console.error(err?.stack || String(err));
  process.exitCode = 1;
});

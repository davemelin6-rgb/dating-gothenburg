import { chromium } from 'playwright';

const STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  locale: 'en-US',
  timezoneId: 'America/New_York',
});
const page = await context.newPage();
await page.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2}', r => r.abort());

// Visit Yahoo Finance once and accept the GDPR consent dialog
await page.goto('https://finance.yahoo.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });

// Accept consent if it appears (EU/GDPR cookie wall)
const acceptBtn = page.getByRole('button', { name: /accept all|agree|acceptera|godkänn/i }).first();
if (await acceptBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
  await acceptBtn.click();
  await page.waitForTimeout(1000);
}

console.log('Fetching stock prices from Yahoo Finance...\n');

for (const ticker of STOCKS) {
  await page.goto(`https://finance.yahoo.com/quote/${ticker}/`, {
    waitUntil: 'domcontentloaded',
    timeout: 20000,
  });
  await page.waitForTimeout(2000);

  const price = await page.evaluate((sym) => {
    // fin-streamer (older Yahoo Finance)
    const streamer = document.querySelector(`fin-streamer[data-symbol="${sym}"][data-field="regularMarketPrice"]`);
    if (streamer) return streamer.getAttribute('data-value') || streamer.textContent;

    // data-testid based (newer Yahoo Finance)
    const testId = document.querySelector('[data-testid="qsp-price"]');
    if (testId) return testId.textContent?.trim();

    // Title fallback: "Apple Inc. (AAPL) Stock Price, News..."  — title sometimes has price
    const title = document.title;
    const m = title.match(/([\d,]+\.\d{2})/);
    if (m) return m[1];

    return null;
  }, ticker);

  if (price) {
    const num = parseFloat(String(price).replace(/,/g, ''));
    console.log(`${ticker.padEnd(6)} $${num.toFixed(2)}`);
  } else {
    const title = await page.title();
    console.log(`${ticker.padEnd(6)} (not found — page: "${title}")`);
  }
}

await browser.close();

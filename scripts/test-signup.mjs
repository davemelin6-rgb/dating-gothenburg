import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

await page.goto('https://matchgbg.se');
await page.waitForTimeout(3000);

// Click sign up link
await page.getByText(/registrera|sign up/i).click();
await page.waitForURL('**/signup', { timeout: 10000 });
await page.waitForTimeout(1500);

// Take screenshot to see the form
await page.screenshot({ path: 'scripts/signup-page.png' });

// Fill visible fields
const nameInput = page.getByPlaceholder(/ditt namn|your name/i);
await nameInput.waitFor({ state: 'visible', timeout: 10000 });
await nameInput.fill('Tutte');

await page.getByPlaceholder(/ålder|age/i).fill('39');
await page.getByText('Man').first().click();

// Get the email and password from the signup form specifically
await page.getByPlaceholder('E-post').fill('test@test.com');
await page.getByPlaceholder(/lösenord|password/i).fill('test123');

await page.screenshot({ path: 'scripts/filled-form.png' });

await page.getByText(/skapa konto|create account/i).click();
await page.waitForTimeout(6000);

await page.screenshot({ path: 'scripts/after-signup.png' });
console.log('URL after signup:', page.url());

// Check for error message
const error = await page.getByText(/failed|error|fel/i).first().textContent().catch(() => null);
if (error) console.log('Error shown:', error);
else console.log('No error — likely success!');

await browser.close();

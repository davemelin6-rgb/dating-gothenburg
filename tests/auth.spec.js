// @ts-check
const { test, expect } = require('@playwright/test');

const WOMAN_EMAIL = 'womantest@test.com';
const WOMAN_PASS = 'woman123';
const MAN_EMAIL = 'mantest@test.com';
const MAN_PASS = 'man123';

async function loginAs(page, email, password) {
  await page.goto('/');
  await page.getByPlaceholder(/e-post|email/i).fill(email);
  await page.getByPlaceholder(/lösenord|password/i).fill(password);
  await page.getByText(/^logga in$|^sign in$/i).click();
  // Wait for tab bar — Swedish: Utforska, English: Discover
  await expect(page.getByText(/utforska|discover/i).first()).toBeVisible({ timeout: 15000 });
}

test.describe('Login', () => {
  test('shows login screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/dating g/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/e-post|email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/lösenord|password/i)).toBeVisible();
  });

  test('shows error on wrong password', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/e-post|email/i).fill(WOMAN_EMAIL);
    await page.getByPlaceholder(/lösenord|password/i).fill('wrongpassword');
    await page.getByText(/^logga in$|^sign in$/i).click();
    await expect(page.getByText(/fel e-post|incorrect email/i)).toBeVisible({ timeout: 10000 });
  });

  test('logs in as Sofia and reaches swipe screen', async ({ page }) => {
    await loginAs(page, WOMAN_EMAIL, WOMAN_PASS);
    await expect(page.getByText(/utforska|discover/i).first()).toBeVisible();
  });

  test('logs in as Erik and reaches swipe screen', async ({ page }) => {
    await loginAs(page, MAN_EMAIL, MAN_PASS);
    await expect(page.getByText(/utforska|discover/i).first()).toBeVisible();
  });
});

test.describe('Swipe screen', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, WOMAN_EMAIL, WOMAN_PASS);
  });

  test('like and nope buttons or empty state are visible', async ({ page }) => {
    const likeBtn = page.locator('text=❤');
    const emptyState = page.getByText(/inga fler|no more profiles/i);
    await expect(likeBtn.or(emptyState)).toBeVisible({ timeout: 8000 });
  });

  test('like button registers a swipe', async ({ page }) => {
    await expect(
      page.locator('text=❤').or(page.getByText(/inga fler|no more profiles/i))
    ).toBeVisible({ timeout: 10000 });
    const likeBtn = page.locator('text=❤').first();
    if (await likeBtn.isVisible()) {
      await likeBtn.click();
      await expect(
        page.getByText(/gillad|liked|det är en match|it's a match|inga fler|no more/i).first()
      ).toBeVisible({ timeout: 8000 });
    } else {
      await expect(page.getByText(/inga fler|no more profiles/i)).toBeVisible();
    }
  });

  test('nope button registers a pass', async ({ page }) => {
    await expect(
      page.locator('text=✕').or(page.getByText(/inga fler|no more profiles/i))
    ).toBeVisible({ timeout: 10000 });
    const nopeBtn = page.locator('text=✕').first();
    if (await nopeBtn.isVisible()) {
      await nopeBtn.click();
      await expect(
        page.getByText(/passad|passed|inga fler|no more/i).first()
      ).toBeVisible({ timeout: 8000 });
    } else {
      await expect(page.getByText(/inga fler|no more profiles/i)).toBeVisible();
    }
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, WOMAN_EMAIL, WOMAN_PASS);
  });

  test('can navigate to Messages tab', async ({ page }) => {
    await page.getByText(/meddelanden|messages/i).first().click();
    await expect(page.getByText(/meddelanden|messages|inga matchningar|no matches/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('can navigate to Profile tab', async ({ page }) => {
    await page.getByText(/^profil$|^profile$/i).first().click();
    await expect(page.getByText(/min profil|my profile/i).first()).toBeVisible({ timeout: 8000 });
  });
});

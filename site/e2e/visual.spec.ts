import { test, expect, type Page } from '@playwright/test';

// Element screenshots, so one change fails one test. Baselines come from CI's
// Linux runner (fonts render differently elsewhere), so this runs only there,
// or locally with VISUAL=1 inside the same Playwright Linux image.
test.skip(process.platform !== 'linux' && !process.env.VISUAL, 'Baselines are rendered on Linux in CI');
test.skip(({ browserName }) => browserName !== 'chromium', 'Baselines come from one browser');

async function ready(page: Page, path: string) {
	await page.goto(path);
	await page.evaluate(() => document.fonts.ready);
}

// Playwright's own options, not an injected stylesheet: the site's CSP blocks those
const opts = { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' } as const;

test('header', async ({ page }) => {
	await ready(page, '/about/');
	await expect(page.locator('.site-header')).toHaveScreenshot('header.png', opts);
});

test('house rules card', async ({ page }) => {
	await ready(page, '/');
	await expect(page.locator('.rules')).toHaveScreenshot('house-rules.png', opts);
});

test('a tape on the shelf', async ({ page }) => {
	await ready(page, '/');
	const tape = page.locator('.tape').filter({ hasText: 'Gone Girl' });
	await tape.scrollIntoViewIfNeeded();
	await page.waitForFunction(() => [...document.images].filter((i) => i.closest('.tape')).slice(0, 6).every((i) => i.complete));
	await expect(tape).toHaveScreenshot('tape.png', opts);
});

test('the Bechdel test card, passing and failing', async ({ page }) => {
	await ready(page, '/films/gone-girl-2014/');
	await expect(page.locator('section.bechdel')).toHaveScreenshot('bechdel-pass.png', opts);
	await ready(page, '/films/fight-club-1999/');
	await expect(page.locator('section.bechdel')).toHaveScreenshot('bechdel-fail.png', opts);
});

test('footer', async ({ page }) => {
	await ready(page, '/privacy/');
	await expect(page.locator('.site-footer')).toHaveScreenshot('footer.png', opts);
});

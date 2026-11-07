import { test, expect } from '@playwright/test';

test.describe('the shelf', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('arrives with the first page of films', async ({ page }) => {
		await expect(page.locator('[data-shelf] li')).toHaveCount(60);
		await expect(page.locator('[data-shelf] li:not([hidden])')).toHaveCount(60);
		await expect(page.locator('[data-shelf-count]')).toHaveText('Showing 60 of 218, 111 pass in all');
	});

	test('searches titles and directors', async ({ page }) => {
		await page.getByLabel('Search').fill('fincher');
		await expect(page.locator('[data-shelf] li:not([hidden])')).toHaveCount(2);
		await expect(page.locator('[data-shelf-count]')).toHaveText('Showing 2 of 218, 1 pass');
	});

	test('filters to passing films and sorts them', async ({ page }) => {
		await page.getByLabel('Show').selectOption('pass');
		await page.getByLabel('Sort').selectOption('old');
		const titles = page.locator('[data-shelf] li:not([hidden]) .title');
		// Filtering shows every match, not a page of them
		await expect(titles).toHaveCount(111);
		await expect(titles.first()).toHaveText('Grand Hotel');
	});

	test('says so when nothing matches, and clears', async ({ page }) => {
		await page.getByLabel('Search').fill('no film has this title');
		await expect(page.getByText('Nothing on the shelf matches')).toBeVisible();
		await page.getByRole('button', { name: 'Clear the search' }).click();
		await expect(page.locator('[data-shelf] li:not([hidden])')).toHaveCount(60);
	});
});

test('without JavaScript, the first page shows and every film is a link away', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('/');
	await expect(page.locator('[data-shelf] li')).toHaveCount(60);
	await expect(page.locator('[data-shelf-controls]')).toBeHidden();
	await page.getByRole('link', { name: 'Every film, A to Z' }).click();
	await expect(page.locator('ol.all li')).toHaveCount(218);
	await context.close();
});

test('the shelf shows a page at a time, and search still covers every film', async ({ page }) => {
	await page.goto('/');
	const visible = page.locator('[data-shelf] li:not([hidden])');
	await expect(visible).toHaveCount(60);
	await page.getByRole('button', { name: 'Show 60 more' }).click();
	await expect(visible).toHaveCount(120);
	await expect(visible.nth(60).locator('a')).toBeFocused();
	await page.getByRole('button', { name: 'Show 60 more' }).click();
	await page.getByRole('button', { name: 'Show 38 more' }).click();
	await expect(visible).toHaveCount(218);
	await expect(page.locator('[data-shelf-more-wrap]')).toBeHidden();
	// Searching looks past the page: Ticker is last by popularity
	await page.getByLabel('Search').fill('ticker');
	await expect(visible).toHaveCount(1);
	await page.getByLabel('Search').fill('');
	await expect(visible).toHaveCount(60);
});

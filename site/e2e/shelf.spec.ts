import { test, expect } from '@playwright/test';

test.describe('the shelf', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('shows every film', async ({ page }) => {
		await expect(page.locator('[data-shelf] li')).toHaveCount(50);
		await expect(page.locator('[data-shelf-count]')).toHaveText('All 50 films, 8 pass');
	});

	test('searches titles and directors', async ({ page }) => {
		await page.getByLabel('Search').fill('fincher');
		await expect(page.locator('[data-shelf] li:not([hidden])')).toHaveCount(2);
		await expect(page.locator('[data-shelf-count]')).toHaveText('Showing 2 of 50, 1 pass');
	});

	test('filters to passing films and sorts them', async ({ page }) => {
		await page.getByLabel('Show').selectOption('pass');
		await page.getByLabel('Sort').selectOption('old');
		const titles = page.locator('[data-shelf] li:not([hidden]) .title');
		await expect(titles).toHaveCount(8);
		await expect(titles.first()).toHaveText('Even Cowgirls Get the Blues');
	});

	test('says so when nothing matches, and clears', async ({ page }) => {
		await page.getByLabel('Search').fill('no film has this title');
		await expect(page.getByText('Nothing on the shelf matches')).toBeVisible();
		await page.getByRole('button', { name: 'Clear the search' }).click();
		await expect(page.locator('[data-shelf] li:not([hidden])')).toHaveCount(50);
	});
});

test('without JavaScript, every film is listed and the controls stay hidden', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('/');
	await expect(page.locator('[data-shelf] li')).toHaveCount(50);
	await expect(page.locator('[data-shelf-controls]')).toBeHidden();
	await context.close();
});

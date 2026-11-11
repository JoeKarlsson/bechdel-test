import { test, expect } from '@playwright/test';
import { shelf } from './pages';

const films = shelf();
const passing = films.filter((f) => f.score === 3);
const PAGE_SIZE = 60;

test.describe('the shelf', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('arrives with the first page of films', async ({ page }) => {
		await expect(page.locator('[data-shelf] li')).toHaveCount(60);
		await expect(page.locator('[data-shelf] li:not([hidden])')).toHaveCount(60);
		await expect(page.locator('[data-shelf-count]')).toHaveText(`Showing ${PAGE_SIZE} of ${films.length.toLocaleString('en-US')}, ${passing.length.toLocaleString('en-US')} pass in all`);
	});

	test('searches titles and directors', async ({ page }) => {
		const fincher = films.filter((f) => f.director.toLowerCase().includes('fincher'));
		expect(fincher.length).toBeGreaterThan(1);
		await page.getByLabel('Search').fill('fincher');
		await expect(page.locator('[data-shelf] li:not([hidden])')).toHaveCount(fincher.length);
		const fincherPasses = fincher.filter((f) => f.score === 3).length;
		await expect(page.locator('[data-shelf-count]')).toHaveText(`Showing ${fincher.length} of ${films.length.toLocaleString('en-US')}, ${fincherPasses} pass`);
	});

	test('filters to passing films and sorts them', async ({ page }) => {
		await page.getByLabel('Show').selectOption('pass');
		await page.getByLabel('Sort').selectOption('old');
		const titles = page.locator('[data-shelf] li:not([hidden]) .title');
		// Filtering shows every match, not a page of them
		await expect(titles).toHaveCount(passing.length);
		const oldest = Math.min(...passing.map((f) => f.year));
		expect(passing.filter((f) => f.year === oldest).map((f) => f.title)).toContain(await titles.first().textContent());
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
	await expect(page.locator('ol.all li')).toHaveCount(films.length);
	await context.close();
});

test('the shelf shows a page at a time, and search still covers every film', async ({ page }) => {
	await page.goto('/');
	const visible = page.locator('[data-shelf] li:not([hidden])');
	await expect(visible).toHaveCount(60);
	await page.getByRole('button', { name: 'Show 60 more' }).click();
	await expect(visible).toHaveCount(120);
	await expect(visible.nth(60).locator('a')).toBeFocused();
	for (let shown = 2 * PAGE_SIZE; shown < films.length; shown += PAGE_SIZE) {
		await page.getByRole('button', { name: `Show ${Math.min(PAGE_SIZE, films.length - shown)} more` }).click();
	}
	await expect(visible).toHaveCount(films.length);
	await expect(page.locator('[data-shelf-more-wrap]')).toBeHidden();
	// Searching looks past the page: Ticker is far down by popularity
	await page.getByLabel('Search').fill('ticker');
	await expect(visible).toHaveCount(1);
	await page.getByLabel('Search').fill('');
	await expect(visible).toHaveCount(60);
});

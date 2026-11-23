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
		await expect(page.locator('[data-shelf-count]')).toHaveText(`${fincher.length} films match, ${fincherPasses} pass`);
	});

	test('filters to passing films and sorts them', async ({ page }) => {
		await page.getByLabel('Show').selectOption('pass');
		await page.getByLabel('Sort').selectOption('old');
		const titles = page.locator('[data-shelf] li:not([hidden]) .title');
		// Filtering shows a page of matches at a time, like browsing
		await expect(titles).toHaveCount(PAGE_SIZE);
		await expect(page.locator('[data-shelf-count]')).toHaveText(`Showing ${PAGE_SIZE} of ${passing.length.toLocaleString('en-US')} matches, ${passing.length.toLocaleString('en-US')} pass`);
		await page.getByRole('button', { name: `Show ${PAGE_SIZE} more` }).click();
		await expect(titles).toHaveCount(2 * PAGE_SIZE);
		const oldest = Math.min(...passing.map((f) => f.year));
		expect(passing.filter((f) => f.year === oldest).map((f) => f.title)).toContain(await titles.first().textContent());
	});

	test('keeps the search, filter and sort in the address, and restores them from it', async ({ page }) => {
		const fincherPasses = films.filter((f) => f.director.toLowerCase().includes('fincher') && f.score === 3);
		expect(fincherPasses.length).toBeGreaterThan(1);
		await page.getByLabel('Search').fill('fincher');
		await page.getByLabel('Show').selectOption('pass');
		await page.getByLabel('Sort').selectOption('az');
		await expect(page).toHaveURL(/\?q=fincher&show=pass&sort=az$/);
		// A refresh or a shared link lands on the same shelf
		await page.reload();
		await expect(page.getByLabel('Search')).toHaveValue('fincher');
		await expect(page.getByLabel('Show')).toHaveValue('pass');
		await expect(page.getByLabel('Sort')).toHaveValue('az');
		await expect(page.locator('[data-shelf] li:not([hidden])')).toHaveCount(fincherPasses.length);
		// A value the form doesn't offer is ignored, not turned into a blank filter
		await page.goto('/?show=nonsense');
		await expect(page.getByLabel('Show')).toHaveValue('all');
		await expect(page.locator('[data-shelf] li:not([hidden])')).toHaveCount(PAGE_SIZE);
	});

	test('says so when nothing matches, and clears', async ({ page }) => {
		await page.getByLabel('Search').fill('no film has this title');
		await expect(page.getByText('Nothing on the shelf matches')).toBeVisible();
		await expect(page.locator('[data-shelf-count]')).toBeHidden();
		await page.getByRole('button', { name: 'Clear the search' }).click();
		await expect(page.locator('[data-shelf] li:not([hidden])')).toHaveCount(60);
		await expect(page.locator('[data-shelf-count]')).toBeVisible();
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
	// Searching looks past the pages shown: Ticker is far down by popularity.
	// With every match shown the button goes, the same as at the end of the shelf
	await page.getByLabel('Search').fill('ticker');
	await expect(visible).toHaveCount(1);
	await expect(page.locator('[data-shelf-more-wrap]')).toBeHidden();
	await page.getByLabel('Search').fill('');
	await expect(visible).toHaveCount(60);
});

test('the shelf holds only the tapes on screen, not every film hidden', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Show 60 more' }).click();
	// Every tape on the page is a visible one: building all 3,700 and hiding
	// most of them froze a phone for a fifth of a second
	await expect(page.locator('[data-shelf] li')).toHaveCount(120);
	await page.getByLabel('Search').fill('fincher');
	const fincher = films.filter((f) => f.director.toLowerCase().includes('fincher'));
	await expect(page.locator('[data-shelf] li')).toHaveCount(fincher.length);
});

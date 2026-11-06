import { test, expect } from '@playwright/test';
import { PAGE_TYPES } from './pages';

for (const [name, path] of Object.entries(PAGE_TYPES)) {
	test(`${name} loads with no errors and no failed requests`, async ({ page }) => {
		const problems: string[] = [];
		page.on('console', (m) => {
			// The 404 page answers with a 404 on purpose
			if (m.type() === 'error' && !(name === 'not found' && m.text().includes('404'))) problems.push(m.text());
		});
		page.on('pageerror', (e) => problems.push(e.message));
		page.on('requestfailed', (r) => problems.push(`failed: ${r.url()}`));

		await page.goto(path);
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
		await page.evaluate(async () => {
			for (let y = 0; y < document.body.scrollHeight; y += 800) {
				window.scrollTo(0, y);
				await new Promise((r) => setTimeout(r, 30));
			}
		});
		await page.waitForLoadState('networkidle');
		expect(problems).toEqual([]);
	});
}

test('the film page leads with the verdict', async ({ page }) => {
	await page.goto('/films/gone-girl-2014/');
	await expect(page.locator('.verdict-stamp')).toHaveText('Passes the Bechdel test');
	await expect(page.getByRole('heading', { name: 'The Bechdel test' })).toBeVisible();
	await expect(page.locator('.score-n')).toContainText('3');
	await page.goto('/films/fight-club-1999/');
	await expect(page.locator('.verdict-stamp')).toHaveText('Fails the Bechdel test');
});

test('a film from the shelf opens its page', async ({ page }) => {
	await page.goto('/');
	await page.locator('.tape a').first().click();
	await expect(page).toHaveURL(/\/films\/[a-z0-9-]+\/$/);
	await expect(page.locator('.verdict-stamp')).toBeVisible();
});

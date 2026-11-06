import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGE_TYPES } from './pages';

for (const [name, path] of Object.entries(PAGE_TYPES)) {
	test(`${name} has no axe violations`, async ({ page }) => {
		await page.goto(path);
		const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
		expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
	});
}

test('the skip link is the first thing Tab reaches and moves focus to the page', async ({ page, browserName }) => {
	test.skip(browserName === 'webkit', 'Safari only tabs to links with Option+Tab');
	await page.goto('/about/');
	await page.keyboard.press('Tab');
	await expect(page.locator(':focus')).toHaveText('Skip to the page');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/#main$/);
});

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGE_TYPES } from './pages';

for (const [name, path] of Object.entries(PAGE_TYPES)) {
	test(`${name} has no axe violations`, async ({ page }) => {
		await page.goto(path);
		// content-visibility: auto skips laying out off-screen sections until
		// they scroll near, and axe then misreads the size of the links around
		// them; a visitor only reaches those links once the section has drawn
		await page.evaluate(() => {
			for (const el of document.querySelectorAll<HTMLElement>('body *'))
				if (getComputedStyle(el).contentVisibility === 'auto') el.style.setProperty('content-visibility', 'visible');
		});
		// The A to Z list repeats one row per film: checking 60 covers the markup, all 3,000+ times out on WebKit
		const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).exclude('ol.all > li:nth-child(n+61)').analyze();
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

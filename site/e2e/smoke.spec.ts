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

test('old hash links from the previous site forward to the new pages', async ({ page }) => {
	await page.goto('/#/film/690e3cd1ce1ff7c7d64a74f6');
	await expect(page).toHaveURL(/\/films\/gone-girl-2014\/$/);
	await page.goto('/#/about');
	await expect(page).toHaveURL(/\/about\/$/);
	await page.goto('/#/film/000000000000000000000000');
	await expect(page.locator('[data-shelf]')).toBeVisible();
});

test('the scene timeline explains a group of scenes on focus, and the arrow keys move along it', async ({ page }) => {
	await page.goto('/films/gone-girl-2014/');
	const bars = page.locator('[data-timeline] button');
	await bars.first().focus();
	await expect(page.locator('[data-readout] .readout-title')).toHaveText(/^Scenes? 1/);
	await expect(page.locator('[data-readout]')).toContainText('Women');
	await page.keyboard.press('ArrowRight');
	await expect(bars.nth(1)).toBeFocused();
	await expect(bars.nth(1)).toHaveAttribute('aria-pressed', 'true');
	await expect(bars.first()).toHaveAttribute('tabindex', '-1');
});

test('exhibits fold on phones, without animating shut on load', async ({ page }, info) => {
	await page.goto('/films/gone-girl-2014/');
	const firstFold = page.locator('details[data-fold]').first();
	await expect(firstFold).toHaveJSProperty('open', info.project.name === 'desktop');
	await expect(page.locator('html')).toHaveAttribute('data-folds-ready', '');
	// Nothing animates on first paint: the folds land closed instead of shrinking
	expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test("an exhibit's heading doesn't read its + or − mark", async ({ page }) => {
	await page.goto('/films/gone-girl-2014/');
	await expect(page.getByRole('heading', { name: /^Exhibit A: the passing scenes?$/ })).toHaveCount(1);
});

test('a finger anywhere on the timeline picks the nearest group of scenes', async ({ page }, info) => {
	test.skip(info.project.name === 'desktop', 'Touch only');
	await page.goto('/films/gone-girl-2014/');
	const chart = page.locator('[data-timeline]');
	await chart.scrollIntoViewIfNeeded();
	const box = (await chart.boundingBox())!;
	await page.touchscreen.tap(box.x + box.width / 2, box.y + 4);
	const pressed = page.locator('[data-timeline] button[aria-pressed="true"]');
	await expect(pressed).toHaveCount(1);
	const bar = (await pressed.boundingBox())!;
	expect(Math.abs(bar.x + bar.width / 2 - (box.x + box.width / 2))).toBeLessThan(bar.width + 4);
});

test('a mistyped page address suggests the nearest page', async ({ page }) => {
	await page.goto('/abuot/');
	await expect(page.getByRole('link', { name: 'About' }).last()).toBeVisible();
	await expect(page.locator('[data-suggest] a')).toHaveAttribute('href', '/about/');
});

test('the long pages open a contents list whose links reach every section', async ({ page }) => {
	for (const path of ['/numbers/', '/about/']) {
		await page.goto(path);
		await page.locator('details.contents summary').click();
		const links = page.locator('details.contents a');
		expect(await links.count()).toBeGreaterThan(5);
		for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) {
			await expect(page.locator(href), `${path}${href}`).toHaveCount(1);
		}
	}
});

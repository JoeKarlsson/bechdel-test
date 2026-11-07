import { test, expect } from '@playwright/test';
import { layoutSample } from './pages';

// One test per width, so they run in parallel
for (const width of [390, 320]) {
	test(`no page scrolls sideways at ${width}px`, async ({ page }, info) => {
		test.skip(info.project.name !== 'desktop', 'Runs once; it sets its own phone widths');
		test.setTimeout(120_000);
		await page.setViewportSize({ width, height: 800 });
		const wide: string[] = [];
		for (const path of layoutSample()) {
			await page.goto(path);
			const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
			if (overflow > 0) wide.push(`${path} (+${overflow})`);
		}
		expect(wide).toEqual([]);
	});
}

test('every page shares one header: same nav position, and text pages put the title in the same place', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'Measured at one viewport');
	const measure = async (path: string) => {
		await page.goto(path);
		return page.evaluate(() => {
			const nav = document.querySelector('nav[aria-label="Main"]')!.getBoundingClientRect();
			const h1 = document.querySelector('h1')!;
			return {
				nav: [Math.round(nav.top), Math.round(nav.right)],
				h1Top: Math.round(h1.getBoundingClientRect().top + window.scrollY),
				h1Size: getComputedStyle(h1).fontSize,
			};
		});
	};
	const home = await measure('/');
	const film = await measure('/films/gone-girl-2014/');
	const text: (readonly [string, Awaited<ReturnType<typeof measure>>])[] = [];
	for (const p of ['/numbers/', '/about/', '/case-study/', '/privacy/', '/no-such-page/']) text.push([p, await measure(p)] as const);

	for (const m of [film, ...text.map(([, m]) => m)]) expect(m.nav).toEqual(home.nav);
	const [, first] = text[0];
	for (const [path, m] of text) {
		expect.soft(m.h1Top, `h1 top on ${path}`).toBe(first.h1Top);
		expect.soft(m.h1Size, `h1 size on ${path}`).toBe(first.h1Size);
	}
});

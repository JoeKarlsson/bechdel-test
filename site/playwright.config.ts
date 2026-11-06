import { defineConfig, devices } from '@playwright/test';

// Tests run against the built site (`npm run build` first), as GitHub Pages serves it.
// Its own port, and never a server that's already running: other projects' Astro
// servers sit on nearby ports, and reusing one would test the wrong site.
const port = Number(process.env.PORT ?? 4583);

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	// Screenshot baselines are per device, not per OS: they're only made on Linux (CI)
	snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
	// A new baseline is written on its first CI run (and uploaded as an artifact
	// to commit); after that, any difference fails
	updateSnapshots: 'missing',
	use: {
		baseURL: `http://localhost:${port}`,
		trace: 'on-first-retry',
		launchOptions: process.env.CHROME ? { executablePath: process.env.CHROME } : {},
	},
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } },
		{ name: 'pixel', use: { ...devices['Pixel 7'] } },
		// WebKit can't use a custom Chromium path, so locally it needs `npx playwright install webkit`
		{ name: 'iphone', use: { ...devices['iPhone 15'], launchOptions: {} } },
	],
	webServer: {
		// --ignore-lock keeps it in the foreground: Astro 7 otherwise hands off to (or
		// backgrounds) a preview already running for this project
		command: `npm run preview -- --port ${port} --ignore-lock`,
		url: `http://localhost:${port}`,
		reuseExistingServer: false,
		timeout: 60_000,
	},
});

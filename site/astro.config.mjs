// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://bechdel.joekarlsson.com',
	trailingSlash: 'always',
	// Astro's compressor drops the line break between text and a following link
	// or <cite> ("Share it onBluesky") instead of leaving a space; browsers
	// collapse whitespace correctly on their own
	compressHTML: false,
	build: {
		format: 'directory',
		// Every stylesheet is a hashed file, so the CSP can allow styles from 'self'
		// without 'unsafe-inline' for <style> blocks
		inlineStylesheets: 'never',
	},
	// Small scripts would otherwise be inlined into the page, which the CSP
	// (script-src 'self', no 'unsafe-inline') blocks
	vite: { build: { assetsInlineLimit: 0 } },
	// Off for the Playwright run: the toolbar adds its own headings and buttons
	devToolbar: { enabled: process.env.ASTRO_E2E !== '1' },
});

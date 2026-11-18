import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isExtensionNoise } from '../src/lib/error-noise.mjs';

test('errors from extension scripts are noise', () => {
	assert.equal(isExtensionNoise('x is undefined', 'chrome-extension://abc/content.js:1', ['plausible']), true);
	assert.equal(isExtensionNoise('boom', 'at f (moz-extension://abc/x.js:2:3)', ['plausible']), true);
	assert.equal(isExtensionNoise('boom', 'safari-web-extension://abc/x.js:9', ['plausible']), true);
});

test("Trusted Types refusals are noise only for policies the site doesn't make", () => {
	const refused = (name) => `Failed to execute 'createPolicy' on 'TrustedTypePolicyFactory': Policy "${name}" disallowed.`;
	assert.equal(isExtensionNoise(refused('dompurify'), 'https://bechdel.joekarlsson.com/x.js:1', ['plausible']), true);
	assert.equal(isExtensionNoise(refused('plausible'), 'https://bechdel.joekarlsson.com/x.js:1', ['plausible']), false);
});

test("the site's own errors are reported", () => {
	assert.equal(isExtensionNoise('shelf is null', 'https://bechdel.joekarlsson.com/_astro/index.js:4', ['plausible']), false);
});

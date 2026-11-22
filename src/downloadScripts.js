/**
 * Download screenplays into scripts/local/ (gitignored: the scripts belong to
 * their writers, so we analyze them but don't republish them), a few at a
 * time, keeping those long enough to be a screenplay.
 */
const fs = require('fs');
const path = require('path');
const { scriptTextFrom } = require('./dailyScript');
const { LOCAL_SCRIPTS_DIR } = require('./manifest');
const { cleanScriptText } = require('./scriptText');

// Files fetched at once, to stay gentle on the sites
const CONCURRENCY = 4;
// Shorter than this, the file holds a stub or an excerpt, not a screenplay
const MIN_SCRIPT_CHARACTERS = 20000;

// Tries per file when a site says it's busy (429) or down (5xx)
const ATTEMPTS = 3;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// The longest wait between tries, whatever the site asks, so a run never stalls for hours
const MAX_RETRY_SECONDS = 120;
// For sites that throttle (the Wayback Machine allows about one request per 8s): the fetchers' --slow
const SLOW_SITE = { concurrency: 1, pauseMs: 8000 };

/** How long to wait before trying again: the site's Retry-After when it gives seconds, else 30s, then 60s */
const retryDelayMs = (retryAfter, attempt) => Math.min(Number(retryAfter) > 0 ? Number(retryAfter) : 30 * attempt, MAX_RETRY_SECONDS) * 1000;

const fetchBytes = async url => {
	for (let attempt = 1; ; attempt++) {
		const response = await fetch(url, { headers: { 'User-Agent': 'bechdel-test script fetcher' }, signal: AbortSignal.timeout(60000) });
		if (response.ok) return Buffer.from(await response.arrayBuffer());
		if ((response.status !== 429 && response.status < 500) || attempt === ATTEMPTS) throw new Error(`${response.status}`);
		await sleep(retryDelayMs(response.headers.get('retry-after'), attempt));
	}
};

/**
 * Save each script ({ url, file, ... }) as scripts/local/<file>, calling
 * onSaved(script) after each. Returns the failures, one line each. Pass
 * SLOW_SITE for a site that throttles.
 */
const downloadScripts = async (queue, onSaved = () => {}, { concurrency = CONCURRENCY, pauseMs = 0 } = {}) => {
	fs.mkdirSync(LOCAL_SCRIPTS_DIR, { recursive: true });
	const pending = [...queue];
	const failures = [];
	const worker = async () => {
		while (pending.length > 0) {
			const script = pending.shift();
			try {
				const text = await scriptTextFrom(script.url, await fetchBytes(script.url));
				if (text === null) throw new Error('not a format we read');
				if (text.trim().length < MIN_SCRIPT_CHARACTERS) throw new Error(`only ${text.trim().length} characters`);
				fs.writeFileSync(path.join(LOCAL_SCRIPTS_DIR, script.file), cleanScriptText(text));
				onSaved(script);
			} catch (error) {
				failures.push(`${script.file} ${script.url}: ${error.message}`);
			}
			await sleep(pauseMs);
		}
	};
	await Promise.all(Array.from({ length: concurrency }, worker));
	return failures.sort();
};

module.exports = { downloadScripts, fetchBytes, retryDelayMs, MIN_SCRIPT_CHARACTERS, SLOW_SITE };

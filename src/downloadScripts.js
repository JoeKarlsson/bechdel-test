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

const fetchBytes = async url => {
	const response = await fetch(url, { headers: { 'User-Agent': 'bechdel-test script fetcher' }, signal: AbortSignal.timeout(60000) });
	if (!response.ok) throw new Error(`${response.status}`);
	return Buffer.from(await response.arrayBuffer());
};

/**
 * Save each script ({ url, file, ... }) as scripts/local/<file>, calling
 * onSaved(script) after each. Returns the failures, one line each.
 */
const downloadScripts = async (queue, onSaved = () => {}) => {
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
		}
	};
	await Promise.all(Array.from({ length: CONCURRENCY }, worker));
	return failures.sort();
};

module.exports = { downloadScripts, fetchBytes };

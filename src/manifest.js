// scripts/manifest.json maps each script file to its film's IMDb id, so a
// film is matched once, by a person checking `npm run match`, not guessed on
// every run. null marks a script with no released film to match (an
// unproduced draft, say), which analyze skips.
const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.resolve(__dirname, '../scripts/manifest.json');

const loadManifest = () => JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

const saveManifest = manifest => {
	const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
	fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(sorted, null, '\t')}\n`);
};

module.exports = { loadManifest, saveManifest, MANIFEST_PATH };

// scripts/manifest.json maps each script file to its film's IMDb id, so a
// film is matched once, by a person checking `npm run match`, not guessed on
// every run. null marks a script with no released film to match (an
// unproduced draft, say), which analyze skips.
//
// Scripts live in scripts/ (committed) or scripts/local/ (gitignored: text we
// may analyze but not republish, such as Script Slug's). The manifest lists
// both, so on a machine without scripts/local/ those entries have no file.
const fs = require('fs');
const path = require('path');

const SCRIPTS_DIR = path.resolve(__dirname, '../scripts');
const LOCAL_SCRIPTS_DIR = path.join(SCRIPTS_DIR, 'local');
const MANIFEST_PATH = path.join(SCRIPTS_DIR, 'manifest.json');

const loadManifest = () => JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

const saveManifest = manifest => {
	const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
	fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(sorted, null, '\t')}\n`);
};

const scriptFilesIn = dir => (fs.existsSync(dir) ? fs.readdirSync(dir).filter(file => file.endsWith('.txt')) : []);

/** Every script on this machine, committed and local, sorted by file name */
const listScriptPaths = () => [
	...scriptFilesIn(SCRIPTS_DIR).map(file => path.join(SCRIPTS_DIR, file)),
	...scriptFilesIn(LOCAL_SCRIPTS_DIR).map(file => path.join(LOCAL_SCRIPTS_DIR, file)),
].sort((a, b) => path.basename(a).localeCompare(path.basename(b)));

/** Where a manifest entry's script is on this machine, or null if it isn't */
const scriptPathFor = file => [path.join(SCRIPTS_DIR, file), path.join(LOCAL_SCRIPTS_DIR, file)].find(fs.existsSync) ?? null;

module.exports = { loadManifest, saveManifest, listScriptPaths, scriptPathFor, MANIFEST_PATH, SCRIPTS_DIR, LOCAL_SCRIPTS_DIR };

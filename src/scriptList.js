/**
 * Which listed scripts ([{ title, year, url }]) are films we don't have yet,
 * each given its file name in scripts/local/.
 */
const path = require('path');
const { scriptFileName } = require('./imsdb');
const { comparableTitle, titleFromScriptName } = require('./fetchMetadata');
const { loadManifest, listScriptPaths } = require('./manifest');

/** The scripts whose titles aren't on disk or in the manifest, as { ...script, file }; the year in the file name pins `npm run match` */
const queueNewTitles = (scripts, files = [...Object.keys(loadManifest()), ...listScriptPaths().map(scriptPath => path.basename(scriptPath))]) => {
	const titlesWeHave = new Set(files.map(file => comparableTitle(titleFromScriptName(path.basename(file, '.txt')).title)));
	const queue = [];
	for (const script of scripts) {
		const title = comparableTitle(script.title);
		if (!title || titlesWeHave.has(title)) continue;
		// A film listed twice (two drafts, two sites) keeps the first
		titlesWeHave.add(title);
		queue.push({ ...script, file: scriptFileName(script.year ? `${script.title} ${script.year}` : script.title) });
	}
	return queue;
};

module.exports = { queueNewTitles };

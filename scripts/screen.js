#!/usr/bin/env node
/**
 * Page vs screen: line up each film's script with its subtitles (downloaded
 * by npm run fetch-subtitles) and write data/screen/<id>.json next to the
 * film's data/films/<id>.json. Method: docs/page-vs-screen/METHODS.md.
 *
 *   npm run screen                               every film with subtitles, not yet compared
 *   npm run screen -- taxi-driver.txt tt0073195  these films (script file or IMDb id)
 *   npm run screen -- --force ...                compare again
 */
const fs = require('fs');
const path = require('path');
const { compareFilmOnDisk, loadFilmRecords, hasSubtitles, SCREEN_DIR, ROOT } = require('../src/screenOnDisk');

const pct = (n, d) => `${Math.round((100 * n) / d)}%`;

const compareOne = async film => {
	const { record } = await compareFilmOnDisk(film);
	fs.mkdirSync(SCREEN_DIR, { recursive: true });
	fs.writeFileSync(path.join(SCREEN_DIR, `${film._id}.json`), `${JSON.stringify({ _id: film._id, ...record }, null, '\t')}\n`);
	if (record.excluded) return `excluded: ${record.excluded}`;
	return `${pct(record.words.kept, record.words.page)} of script words on screen, ${pct(record.words.notInScript, record.words.screen)} of screen words not in the script, ${record.subtitles.used} versions, Bechdel ${record.bechdel.page.score} -> ${record.bechdel.strict.score}/${record.bechdel.lenient.score} (${record.bechdel.change})`;
};

const main = async () => {
	process.loadEnvFile(path.join(ROOT, '.env'));
	const args = process.argv.slice(2);
	const force = args.includes('--force');
	const wanted = new Set(args.filter(arg => !arg.startsWith('--')));
	const films = loadFilmRecords()
		.filter(film => film.script?.file)
		.filter(film => (wanted.size > 0 ? wanted.has(film.script.file) || wanted.has(film.idIMDB) : hasSubtitles(film)))
		.filter(film => force || wanted.size > 0 || !fs.existsSync(path.join(SCREEN_DIR, `${film._id}.json`)));
	let failed = 0;
	for (const film of films) {
		let status;
		try {
			status = await compareOne(film);
		} catch (error) {
			failed++;
			status = `FAILED: ${error.message}`;
		}
		console.log(`${film.title} (${film.year}): ${status}`);
	}
	if (failed > 0) process.exitCode = 1;
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});

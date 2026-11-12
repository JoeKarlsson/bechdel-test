// Page vs screen: a screenplay's dialogue against the subtitles of the film
// as released. The method, fixed before the full run, is in
// docs/page-vs-screen/METHODS.md; the section numbers below refer to it.
const crypto = require('crypto');
const { alignDialogue, lineShares, normalizeWords } = require('./align');
const { cleanSubtitles, isSdh } = require('./subtitles');
const { scoreBechdel } = require('./bechdel/score');
const { normalizeSpeaker } = require('./screenplay');

const METHOD = {
	version: '0.1-provisional',
	// line labels (§1.5): kept at or above KEPT of its words on screen, cut below CHANGED;
	// a subtitle line is not in the script below SCRIPTED of its words matched
	thresholds: { kept: 0.8, changed: 0.3, scripted: 0.2 },
	// version selection (§1.3)
	minLanguageConfidence: 0.9,
	runtimeShare: { min: 0.85, max: 1.1 },
	minLines: 300,
	minAnchoredShare: 0.2,
	maxVersions: 9,
	seed: 'page-vs-screen-2026-11-12',
	// quotes shown on the site: at most this many per kind, each at most this many words
	quotes: { perKind: 5, maxWords: 20, minWords: 4 },
	bins: 48,
};

/**
 * What kind of script this is, from its title page (§1.4). A transcript or
 * post-production script is written from the finished film, so it can't
 * show what changed on the way there.
 */
const draftLabel = scriptText => {
	const head = scriptText.slice(0, 3000);
	if (/post[- ]?production script|transcript|as broadcast|continuity script|dialogue list|running time\s*:|released\s*:/i.test(head)) return 'transcript';
	if (/shooting (?:script|draft)|final (?:draft|shooting)|production draft|revised|revisions?\b|(?:white|blue|pink|yellow|green|goldenrod) pages/i.test(head)) return 'shooting';
	if (/\b(?:first|second|third|1st|2nd|3rd|early|rough) draft\b/i.test(head)) return 'early';
	return 'unknown';
};

/**
 * The subtitle versions fit to stand for the film (§1.3), and why the others
 * weren't. `versions` are { id, sentences, meta } from parseOpusXml.
 */
const eligibleVersions = (versions, runtimeSeconds) => {
	const rejected = {};
	const reject = reason => { rejected[reason] = (rejected[reason] ?? 0) + 1; return false; };
	const seen = new Set();
	const eligible = versions.map(version => {
		const cleaned = cleanSubtitles(version.sentences);
		// a line of only hesitations ("Mm-hmm.") has no words to match, and would read as a line not in the script
		return { ...version, ...cleaned, lines: cleaned.lines.filter(line => normalizeWords(line.text).length > 0) };
	}).filter(version => {
		const { meta } = version;
		if (meta.machineTranslated) return reject('machine translated');
		if (meta.languageConfidence !== null && meta.languageConfidence < METHOD.minLanguageConfidence) return reject('not English');
		if (meta.cds && meta.cds !== '1/1') return reject('split across CDs');
		if (version.lines.length < METHOD.minLines) return reject('too few lines');
		const lastCue = Math.max(...version.lines.map(line => line.end ?? line.start ?? 0));
		if (!runtimeSeconds) return reject('no runtime to check against');
		const share = lastCue / runtimeSeconds;
		if (share < METHOD.runtimeShare.min || share > METHOD.runtimeShare.max) return reject('runtime mismatch');
		const fingerprint = crypto.createHash('sha1').update(normalizeWords(version.lines.map(l => l.text).join(' ')).join(' ')).digest('hex');
		if (seen.has(fingerprint)) return reject('duplicate');
		seen.add(fingerprint);
		return true;
	});
	// a fixed, seeded order, so the same versions are picked on every run
	const order = id => crypto.createHash('sha1').update(`${METHOD.seed}:${id}`).digest('hex');
	eligible.sort((a, b) => order(a.id).localeCompare(order(b.id)));
	return { eligible: eligible.slice(0, METHOD.maxVersions), available: eligible.length, rejected };
};

const texts = version => version.lines.map(line => line.text);

/** Share of two subtitle versions' words that match each other */
const agreement = (a, b) => {
	const { page, screen } = alignDialogue(texts(a), texts(b));
	const matched = page.match.filter(j => j >= 0).length;
	return (2 * matched) / Math.max(1, page.words.length + screen.words.length);
};

/** The version that agrees most with the others (the medoid), and the mean agreement between versions */
const primaryVersion = versions => {
	if (versions.length === 1) return { primary: versions[0], meanAgreement: null };
	const totals = versions.map(() => 0);
	let sum = 0;
	let pairs = 0;
	for (let i = 0; i < versions.length; i++) {
		for (let j = i + 1; j < versions.length; j++) {
			const score = agreement(versions[i], versions[j]);
			totals[i] += score;
			totals[j] += score;
			sum += score;
			pairs++;
		}
	}
	const best = totals.indexOf(Math.max(...totals));
	return { primary: versions[best], meanAgreement: sum / pairs };
};

const label = ({ words, matched }) => {
	if (words === 0) return null;
	const share = matched / words;
	return share >= METHOD.thresholds.kept ? 'kept' : share >= METHOD.thresholds.changed ? 'changed' : 'cut';
};

const wordCount = text => text.split(/\s+/).filter(Boolean).length;

/** Up to `count` items spread evenly through the film, in order */
const spread = (items, count) => (items.length <= count ? items
	: Array.from({ length: count }, (_, k) => items[Math.floor(((k + 0.5) * items.length) / count)]));

const binsOf = (count, bins, fill) => {
	const out = Array.from({ length: bins }, () => ({}));
	for (let i = 0; i < count; i++) {
		const bin = out[Math.min(bins - 1, Math.floor((i * bins) / count))];
		const key = fill(i);
		if (key) bin[key] = (bin[key] ?? 0) + 1;
	}
	return out;
};

/**
 * The film as heard (§1.7): subtitle lines in order, each with the speaker
 * and scene of the script line it matched. A line not in the script gets its
 * SDH speaker label when that names a script speaker, otherwise no speaker;
 * it sits in the scene of the line before it.
 */
const screenScreenplay = (dialogue, screenLines, lineOwner, resolved, unknownAs) => {
	const scenes = [];
	let sceneIndex = 0;
	for (const [j, line] of screenLines.entries()) {
		const owner = lineOwner[j];
		let speaker;
		if (owner !== null) {
			speaker = dialogue[owner].speaker;
			sceneIndex = dialogue[owner].sceneIndex;
		} else {
			const labelled = line.speaker && normalizeSpeaker(line.speaker);
			speaker = labelled && resolved.has(labelled) ? labelled : null;
		}
		if (speaker === null) {
			if (unknownAs === 'skip') continue;
			speaker = unknownAs;
		}
		const last = scenes[scenes.length - 1];
		const block = { kind: 'dialogue', speaker, text: line.text };
		if (last && last.sceneIndex === sceneIndex) last.blocks.push(block);
		else scenes.push({ sceneIndex, heading: null, blocks: [block] });
	}
	return { scenes };
};

const rulesOf = score => [score >= 1, score >= 2, score >= 3];

/**
 * @param {object} film
 * @param {string} film.scriptText
 * @param {{scenes: Array}} film.screenplay - from analyzeScriptText
 * @param {Map} film.resolved - from analyzeScriptText
 * @param {Array} film.characters - from charactersFromCast
 * @param {number} film.pageScore - the page's Bechdel score
 * @param {Array<{id, sentences, meta}>} film.versions - every corpus subtitle for the film
 * @param {number|null} film.runtimeSeconds - TMDB's runtime
 * @returns {{record: object, detail?: object}} record is data/screen/<id>.json; detail has the per-line results
 */
const compareFilm = ({ scriptText, screenplay, resolved, characters, pageScore, versions, runtimeSeconds }) => {
	const draft = draftLabel(scriptText);
	const { eligible, available, rejected } = eligibleVersions(versions, runtimeSeconds);
	const base = { method: METHOD, script: { draft }, subtitles: { candidates: versions.length, eligible: available, rejected } };
	if (draft === 'transcript') return { record: { ...base, excluded: 'the script is a transcript of the film' } };
	if (eligible.length === 0) return { record: { ...base, excluded: 'no subtitle version passed the selection rules' } };

	const dialogue = screenplay.scenes.flatMap((scene, sceneIndex) => scene.blocks
		.filter(block => block.kind === 'dialogue').map(block => ({ ...block, sceneIndex })));
	const pageTexts = dialogue.map(block => block.text);

	// every version against the script; a word is on screen if most versions have it (§1.3)
	const alignments = eligible.map(version => alignDialogue(pageTexts, texts(version)));
	const { page } = alignments[0];
	const votes = new Uint8Array(page.words.length);
	for (const { page: aligned } of alignments) aligned.match.forEach((j, i) => { if (j >= 0) votes[i]++; });
	const onScreen = i => votes[i] * 2 > alignments.length;
	const pageLines = lineShares(dialogue.length, page.owner, onScreen);
	const pageLabels = pageLines.map(label);

	const { primary, meanAgreement } = primaryVersion(eligible);
	const primaryAlignment = alignments[eligible.indexOf(primary)];
	const screenLines = primary.lines;
	const screenShares = lineShares(screenLines.length, primaryAlignment.screen.owner, j => primaryAlignment.screen.matched[j]);
	// each subtitle line's script line: the one most of its matched words came from
	const lineOwner = screenLines.map(() => null);
	const votesByLine = screenLines.map(() => new Map());
	primaryAlignment.page.match.forEach((j, i) => {
		if (j < 0) return;
		const votesHere = votesByLine[primaryAlignment.screen.owner[j]];
		votesHere.set(page.owner[i], (votesHere.get(page.owner[i]) ?? 0) + 1);
	});
	votesByLine.forEach((byLine, j) => {
		if (screenShares[j].words && screenShares[j].matched / screenShares[j].words >= METHOD.thresholds.scripted) {
			lineOwner[j] = [...byLine].sort((a, b) => b[1] - a[1])[0][0];
		}
	});
	const notInScript = j => lineOwner[j] === null;

	const keptWords = page.words.filter((_, i) => onScreen(i)).length;
	const screenWords = primaryAlignment.screen.words.length;
	const addedWords = primaryAlignment.screen.matched.filter(m => !m).length;
	const movedWords = primaryAlignment.page.moved.reduce((a, b) => a + b, 0);
	const anchoredShare = primaryAlignment.page.match.filter(j => j >= 0).length / Math.max(1, page.words.length);
	// so little in common that the subtitles are likely another film or language (§1.4)
	if (anchoredShare < METHOD.minAnchoredShare) return { record: { ...base, excluded: 'the subtitles barely match the script', quality: { anchoredShare } } };

	const count = (labels, value) => labels.filter(l => l === value).length;
	const byGender = {};
	for (const gender of ['w', 'm', 'unknown']) {
		const mine = pageLabels.filter((l, i) => l && (resolved.get(dialogue[i].speaker)?.gender ?? 'unknown') === gender);
		byGender[gender] = { lines: mine.length, kept: count(mine, 'kept'), changed: count(mine, 'changed'), cut: count(mine, 'cut') };
	}

	const byMinute = Array.from({ length: METHOD.bins }, () => ({ scripted: 0, notInScript: 0 }));
	screenLines.forEach((line, j) => {
		const bin = Math.min(METHOD.bins - 1, Math.max(0, Math.floor(((line.start ?? 0) * METHOD.bins) / runtimeSeconds)));
		byMinute[bin][notInScript(j) ? 'notInScript' : 'scripted'] += screenShares[j].words;
	});

	const pageBechdel = scoreBechdel(screenplay, resolved, characters).bechdelScore;
	if (pageBechdel !== pageScore) throw new Error(`page score ${pageBechdel} differs from the film's ${pageScore}: re-run npm run analyze for it first`);
	const strict = scoreBechdel(screenScreenplay(dialogue, screenLines, lineOwner, resolved, 'SOMEONE UNHEARD'), resolved, characters).bechdelScore;
	const lenient = scoreBechdel(screenScreenplay(dialogue, screenLines, lineOwner, resolved, 'skip'), resolved, characters).bechdelScore;
	const passes = score => score === 3;
	const change = passes(strict) !== passes(lenient) ? 'unclear'
		: passes(pageBechdel) === passes(strict) ? 'same'
			: passes(pageBechdel) ? 'page-pass-screen-fail' : 'page-fail-screen-pass';

	const { perKind, maxWords, minWords } = METHOD.quotes;
	const fits = text => wordCount(text) >= minWords && wordCount(text) <= maxWords;
	const screenTextOf = owner => screenLines.filter((_, j) => lineOwner[j] === owner).map(l => l.text).join(' ');
	const named = speaker => resolved.get(speaker)?.named;
	const quotes = {
		cut: spread(dialogue.map((d, i) => ({ ...d, i })).filter(d => pageLabels[d.i] === 'cut' && named(d.speaker) && fits(d.text)), perKind)
			.map(d => ({ speaker: d.speaker, text: d.text })),
		notInScript: spread(screenLines.filter((line, j) => notInScript(j) && fits(line.text)), perKind)
			.map(line => ({ at: Math.round(line.start ?? 0), text: line.text })),
		changed: spread(dialogue.map((d, i) => ({ ...d, i, screen: screenTextOf(i) }))
			.filter(d => pageLabels[d.i] === 'changed' && named(d.speaker) && fits(d.text) && fits(d.screen)), perKind)
			.map(d => ({ speaker: d.speaker, page: d.text, screen: d.screen })),
	};

	const record = {
		...base,
		subtitles: {
			...base.subtitles,
			used: eligible.length,
			primary: primary.id,
			versions: eligible.map(v => v.id),
			sdh: isSdh(primary.sentences, primary),
			meanAgreement,
			lyricsDropped: primary.lyrics,
		},
		runtimeSeconds,
		quality: { anchoredShare },
		words: { page: page.words.length, screen: screenWords, kept: keptWords, cut: page.words.length - keptWords, notInScript: addedWords, moved: movedWords },
		lines: {
			page: dialogue.length,
			kept: count(pageLabels, 'kept'),
			changed: count(pageLabels, 'changed'),
			cut: count(pageLabels, 'cut'),
			screen: screenLines.length,
			notInScript: screenLines.filter((_, j) => notInScript(j)).length,
		},
		byGender,
		byScriptOrder: binsOf(dialogue.length, METHOD.bins, i => pageLabels[i]),
		byMinute,
		bechdel: { page: { score: pageBechdel, rules: rulesOf(pageBechdel) }, strict: { score: strict, rules: rulesOf(strict) }, lenient: { score: lenient, rules: rulesOf(lenient) }, change },
		quotes,
	};
	// per-line results for checking by hand (npm run screen:label); they hold script and subtitle text, so they aren't published
	const detail = { dialogue, pageShares: pageLines, screenLines, screenShares, lineOwner, primary: primary.id };
	return { record, detail };
};

module.exports = { compareFilm, draftLabel, eligibleVersions, screenScreenplay, METHOD };

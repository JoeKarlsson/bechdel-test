const { parseOpusXml } = require('./opus');
const { cleanSubtitles } = require('./subtitles');
const { alignDialogue, normalizeWords } = require('./align');
const { draftLabel, eligibleVersions, screenScreenplay } = require('./pageVsScreen');

describe('parseOpusXml', () => {
	const xml = `<?xml version="1.0" encoding="utf-8"?>
<document id="1">
  <s id="1">
    <time id="T1S" value="00:05:14,106" />
Harry, answer that.
    <time id="T1E" value="00:05:15,858" />
  </s>
  <s id="2">
    <time id="T2S" value="00:05:22,990" />
-There's porno theaters for that.
  </s>
  <s id="3">
-I know.
    <time id="T2E" value="00:05:26,703" />
  </s>
  <meta><source><duration>113</duration><cds>1/1</cds></source>
  <subtitle><machine_translated>0</machine_translated><confidence>0.99</confidence><duration>01:53:3,5</duration></subtitle></meta>
</document>`;

	it('gives each sentence the start and end of the cue it sits in', () => {
		const { sentences, meta } = parseOpusXml(xml);
		expect(sentences).toEqual([
			{ start: 314.106, end: 315.858, text: 'Harry, answer that.' },
			{ start: 322.99, end: 326.703, text: "-There's porno theaters for that." },
			{ start: 322.99, end: 326.703, text: '-I know.' },
		]);
		expect(meta).toMatchObject({ runtimeMinutes: 113, cds: '1/1', machineTranslated: false, languageConfidence: 0.99, lastCue: 6783.5 });
	});
});

describe('cleanSubtitles', () => {
	it('drops sound tags, lyrics and credits, and keeps speaker labels and dialogue dashes', () => {
		const { lines, lyrics, credits } = cleanSubtitles([
			{ start: 1, end: 2, text: '<i>[door slams]</i>' },
			{ start: 2, end: 3, text: 'KAT: (sighs) Whatever.' },
			{ start: 3, end: 4, text: '- I know.' },
			{ start: 4, end: 5, text: '♪ Blue moon ♪' },
			{ start: 5, end: 6, text: 'Subtitles by SomeoneSubs' },
		]);
		expect(lines).toEqual([
			{ start: 2, end: 3, text: 'Whatever.', speaker: 'KAT', turn: true },
			{ start: 3, end: 4, text: 'I know.', speaker: null, turn: true },
		]);
		expect([lyrics, credits]).toEqual([1, 1]);
	});
});

describe('alignDialogue', () => {
	it('treats spelling variants as the same words', () => {
		expect(normalizeWords("I'm gonna be 26, Mr. Bickle!")).toEqual(['im', 'going', 'to', 'be', 'twenty', 'six', 'mister', 'bickle']);
	});

	it('finds kept, cut, moved and unscripted words', () => {
		const page = [
			'I can not sleep nights and I ride around all night long',
			'this whole speech about the city got cut from the film entirely',
			'you should know where the bridge is going to be tonight',
			'the scene that moved later in the edit has a lot of distinct words in it',
		];
		const screen = [
			'the scene that moved later in the edit has a lot of distinct words in it',
			'I can not sleep nights and I ride around all night long',
			'you talking to me',
			'you should know where the bridge is going to be tonight',
		];
		const { page: p, screen: s } = alignDialogue(page, screen);
		const matchedIn = line => p.owner.map((owner, i) => owner === line && p.match[i] >= 0).filter(Boolean).length;
		expect(matchedIn(0)).toBe(12);
		expect(matchedIn(1)).toBe(0);
		expect(matchedIn(3)).toBe(16);
		expect(p.moved.filter(Boolean).length).toBe(16);
		expect(s.owner.map((owner, j) => owner === 2 && s.matched[j]).filter(Boolean)).toHaveLength(0);
	});
});

describe('draftLabel', () => {
	it('reads the title page', () => {
		expect(draftLabel('"THE SHINING." Post Production Script.')).toBe('transcript');
		expect(draftLabel('CASABLANCA Released: 1942 Running Time: 102 minutes')).toBe('transcript');
		expect(draftLabel('MEAN GIRLS by Tina Fey revised 06/03/03')).toBe('shooting');
		expect(draftLabel('FIRST DRAFT, July 1980')).toBe('early');
		expect(draftLabel('HEAT by Michael Mann')).toBe('unknown');
	});
});

describe('eligibleVersions', () => {
	const lines = n => Array.from({ length: n }, (_, i) => ({ start: i * 20, end: i * 20 + 2, text: `line number ${i} is here` }));
	const version = (id, overrides = {}) => ({ id, sentences: lines(320), meta: { machineTranslated: false, languageConfidence: 1, cds: '1/1' }, ...overrides });

	it('keeps whole, English, single-file versions that fit the runtime, once each', () => {
		const { eligible, rejected } = eligibleVersions([
			version('a'),
			version('copy'),
			version('cd2', { meta: { cds: '2/2' } }),
			version('mt', { meta: { machineTranslated: true } }),
			version('half', { sentences: lines(320).map(l => ({ ...l, start: l.start / 2, end: l.end / 2 })) }),
		], 6400);
		expect(eligible.map(v => v.id)).toEqual(['a']);
		expect(rejected).toEqual({ duplicate: 1, 'split across CDs': 1, 'machine translated': 1, 'runtime mismatch': 1 });
	});
});

describe('screenScreenplay', () => {
	const dialogue = [
		{ speaker: 'ANN', text: 'a', sceneIndex: 0 },
		{ speaker: 'BEA', text: 'b', sceneIndex: 0 },
	];
	const resolved = new Map([['ANN', { gender: 'w', named: true }], ['BEA', { gender: 'w', named: true }]]);
	const screen = [{ text: 'a' }, { text: 'new line', speaker: null }, { text: 'b' }];

	it('reads an unknown speaker either as someone else or not at all', () => {
		const strict = screenScreenplay(dialogue, screen, [0, null, 1], resolved, 'SOMEONE UNHEARD');
		const lenient = screenScreenplay(dialogue, screen, [0, null, 1], resolved, 'skip');
		expect(strict.scenes[0].blocks.map(b => b.speaker)).toEqual(['ANN', 'SOMEONE UNHEARD', 'BEA']);
		expect(lenient.scenes[0].blocks.map(b => b.speaker)).toEqual(['ANN', 'BEA']);
	});
});

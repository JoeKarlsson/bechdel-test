const { charactersFromCast, analyzeScriptText, aiSectionsOf, buildFilmRecord } = require('./analyzeFilm');
const { titleFromScriptName } = require('./fetchMetadata');

const cast = [
	{ name: 'Ann Actor', character: 'Ripley', gender: 1 },
	{ name: 'Lambert Actor', character: 'Lambert', gender: 1 },
	{ name: 'Dallas Actor', character: 'Dallas', gender: 2 },
	{ name: 'Unknown Actor', character: 'Mother', gender: 0 },
];

// A script long enough to analyze: one scene, the speakers taking turns
const longScript = speakers => `INT. SHIP - DAY\n\nThen Ripley turns and Lambert follows, and Dallas waits.\n\n${
	Array.from({ length: 160 }, (_, i) => `                    ${speakers[i % speakers.length]}\n          Line number ${i} about the engines.\n`).join('\n')}`;

describe('analyzeScriptText', () => {
	it('measures who gets heard: first woman, longest stretch without one, words, and the reverse test', () => {
		const { script } = analyzeScriptText(longScript(['DALLAS', 'DALLAS', 'RIPLEY', 'LAMBERT']), charactersFromCast(cast));
		expect(script.measures.firstWomanLine).toBe(3);
		expect(script.measures.longestWithoutWoman).toBe(2);
		expect(script.measures.longestWithoutWomanStart).toBe(1);
		expect(script.measures.words.m).toBe(80 * 6);
		expect(script.measures.reverseScore).toBe(0);
	});

	it('applies a gender correction by hand, and rejects one for a speaker who never speaks', () => {
		const characters = charactersFromCast(cast);
		const { script } = analyzeScriptText(longScript(['RIPLEY', 'MOTHER']), characters, { MOTHER: 'm' });
		expect(script.speakers.find(s => s.name === 'MOTHER').gender).toBe('m');
		expect(() => analyzeScriptText(longScript(['RIPLEY']), characters, { ASH: 'm' })).toThrow('never speaks');
	});

	it("refuses a script it can't find enough dialogue in, instead of scoring noise", () => {
		expect(() => analyzeScriptText('FADE IN:\n\nA dark room. Nothing happens.\n', charactersFromCast(cast)))
			.toThrow("script didn't parse: only 0 lines of dialogue found");
	});
});

describe('buildFilmRecord', () => {
	const omdb = {
		Title: 'Alien', Year: '1979', Genre: 'Horror, Sci-Fi', Director: 'Ridley Scott', Writer: 'N/A',
		Awards: 'N/A', Plot: 'In space.', Released: '22 Jun 1979', Rated: 'R', Poster: 'N/A',
		imdbID: 'tt0078748', imdbRating: '8.5', Metascore: 'N/A',
	};
	const record = buildFilmRecord({
		id: 'tt0078748', dateUploaded: '2026-11-06T00:00:00.000Z', omdb, cast,
		images: { backdrops: [{ file_path: '/b.jpg' }], posters: [] },
		bechdelResults: { bechdelScore: 3 }, enhancedAnalytics: {},
	});

	it('maps OMDB values and drops its "N/A" placeholders', () => {
		expect(record.year).toBe(1979);
		expect(record.genres).toEqual(['Horror', 'Sci-Fi']);
		expect(record.directors).toEqual([{ name: 'Ridley Scott' }]);
		expect(record.writers).toEqual([]);
		expect(record.awards).toEqual([]);
		expect(record.metascore).toBeNull();
		expect(record.urlPoster).toBeNull();
		expect(record).not.toHaveProperty('bechdelData');
	});

	it('stores TMDB genders as the strings the site reads, and none for unknown', () => {
		expect(record.actors[0]).toEqual({ actorName: 'Ann Actor', character: 'Ripley', actorActress: '1' });
		expect(record.actors[3]).not.toHaveProperty('actorActress');
	});

	it('summarizes key crew in job order, counts departments by gender, and works out ages at release', () => {
		const withCrew = buildFilmRecord({
			id: 'tt0078748', dateUploaded: '2026-11-06', omdb, cast: [{ id: 7, name: 'Ann Actor', character: 'Ripley', gender: 1 }],
			crew: [
				{ job: 'Editor', name: 'Terry Rawlings', gender: 2, department: 'Editing' },
				{ job: 'Director', name: 'Ridley Scott', gender: 2, department: 'Directing' },
				{ job: 'Director', name: 'Ridley Scott', gender: 2, department: 'Directing' },
				{ job: 'Boom Operator', name: 'Someone', gender: 0, department: 'Sound' },
				{ job: 'Casting', name: 'Mary Selway', gender: 1, department: 'Production' },
				{ job: 'Writer', name: 'Pat Doe', gender: 3, department: 'Writing' },
			],
			details: { release_date: '1979-05-25', budget: 11000000, revenue: 0 },
			birthdays: new Map([[7, '1949-10-08']]),
			images: {}, bechdelResults: {}, enhancedAnalytics: {},
		});
		expect(withCrew.crew.roles.map(r => `${r.job}: ${r.name} (${r.gender})`)).toEqual([
			'Director: Ridley Scott (m)', 'Writer: Pat Doe (nb)', 'Editor: Terry Rawlings (m)', 'Casting: Mary Selway (w)',
		]);
		expect(withCrew.crew.departments.Sound).toEqual({ w: 0, m: 0, nb: 0, unknown: 1 });
		expect(withCrew.actors[0].age).toBe(29);
		expect(withCrew.money).toEqual({ budget: 11000000, revenue: null });
	});

	it('builds TMDB image URLs', () => {
		expect(record.images).toEqual({ backdrop: 'https://image.tmdb.org/t/p/original/b.jpg', poster: '' });
	});
});

describe('aiSectionsOf', () => {
	it('keeps only the AI sections of stored analytics', () => {
		expect(aiSectionsOf({ femaleAgency: { agencyScore: 4 }, keyScenes: [], characterDialogue: [] }))
			.toEqual({ femaleAgency: { agencyScore: 4 } });
		expect(aiSectionsOf(undefined)).toEqual({});
		expect(aiSectionsOf({ femaleAgency: {}, enhancedBechdelValidation: {} }, { keepSceneReview: false }))
			.toEqual({ femaleAgency: {} });
	});
});

describe('titleFromScriptName', () => {
	it('reads a trailing year as a year, not part of the title', () => {
		expect(titleFromScriptName('deep-cover-1992')).toEqual({ title: 'deep cover', year: '1992' });
		expect(titleFromScriptName('blade-runner')).toEqual({ title: 'blade runner', year: null });
	});
});

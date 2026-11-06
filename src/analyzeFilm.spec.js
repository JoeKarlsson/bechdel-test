const { charactersFromCast, analyzeScriptText, aiSectionsOf, buildFilmRecord } = require('./analyzeFilm');
const { titleFromScriptName } = require('./fetchMetadata');

const cast = [
	{ name: 'Ann Actor', character: 'Ripley', gender: 1 },
	{ name: 'Lambert Actor', character: 'Lambert', gender: 1 },
	{ name: 'Dallas Actor', character: 'Dallas', gender: 2 },
	{ name: 'Unknown Actor', character: 'Mother', gender: 0 },
];

describe('analyzeScriptText', () => {
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

const scriptAnalysis = require('./scriptAnalysis');
const extractScenes = require('../extractScenes');
const mockMovieScript = require('../../__mocks__/mock-boyhood');
const mockData = require('../../getFilmData/__mocks__/mock-film-data');

describe('Script Analysis methods', () => {
	it('should return a module', () => {
		expect(typeof scriptAnalysis).toBe('object');
	});

	describe('#scriptAnalysis', () => {
		it('should return the bechdel result for a script', async () => {
			const characters = mockData.actors;
			const scenes = extractScenes(mockMovieScript);
			const result = await scriptAnalysis.scriptAnalysis(characters, scenes);

			expect(result.pass).toBe(true);
			expect(result.bechdelScore).toBe(3);
			expect(result.numScenesPass).toBe(10);
			expect(result.numScenesDontPass).toBe(151);
			expect(result.scenesThatPass.length).toBe(10);
		});
	});

	describe('#scriptGenderAnalytics', () => {
		it('should return the bechdel result for a script', async () => {
			const characters = mockData.actors;
			const result = await scriptAnalysis.scriptGenderAnalytics(
				characters,
				mockMovieScript
			);

			expect(result.pass).toBe(true);
			expect(result.bechdelScore).toBe(3);
			expect(result.numScenesPass).toBe(10);
			expect(result.numScenesDontPass).toBe(151);
			expect(result.scenesThatPass.length).toBe(10);
			expect(result.numOfFemalesCharsWithDialogue).toBe(19);
			expect(result.numOfMaleCharsWithDialogue).toBe(22);
			expect(result.totalLinesFemaleDialogue).toBe(802);
			expect(result.totalLinesMaleDialogue).toBe(1063);
		});
	});
});

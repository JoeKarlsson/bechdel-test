const scriptAnalysis = require('./scriptAnalysis');
const extractScenes = require('../extractScenes');
const BechdelResults = require('../BechdelResults');
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
			const bechdelResults = new BechdelResults();
			const result = await scriptAnalysis.scriptAnalysis(characters, scenes, bechdelResults);

			expect(result.pass).toBe(true);
			expect(result.bechdelScore).toBe(3);
			expect(result.numScenesPass).toBe(5);
			expect(result.numScenesDontPass).toBe(156);
			expect(result.scenesThatPass.length).toBe(5);
		});
	});

	describe('#scriptGenderAnalytics', () => {
		it('should return the bechdel result for a script', async () => {
			const characters = mockData.actors;
			const bechdelResults = new BechdelResults();
			// First run scriptAnalysis to set pass/score/scenes
			const scenes = extractScenes(mockMovieScript);
			scriptAnalysis.scriptAnalysis(characters, scenes, bechdelResults);
			// Then run scriptGenderAnalytics with same bechdelResults
			const result = await scriptAnalysis.scriptGenderAnalytics(
				characters,
				mockMovieScript,
				bechdelResults
			);

			expect(result.pass).toBe(true);
			expect(result.bechdelScore).toBe(3);
			expect(result.numScenesPass).toBe(5);
			expect(result.numScenesDontPass).toBe(156);
			expect(result.scenesThatPass.length).toBe(5);
			expect(result.numOfFemalesCharsWithDialogue).toBe(5);
			expect(result.numOfMaleCharsWithDialogue).toBe(8);
			expect(result.totalLinesFemaleDialogue).toBe(550);
			expect(result.totalLinesMaleDialogue).toBe(941);
		});
	});
});

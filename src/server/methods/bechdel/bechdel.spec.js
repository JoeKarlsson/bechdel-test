const path = require('path');
const getBechdelResults = require('./bechdel.js');

jest.mock('../getFilmData/getFilmData');
jest.mock('../script');

describe('Bechdel methods', () => {
	it('should return a module', () => {
		expect(typeof getBechdelResults).toBe('function');
	});

	describe('#getBechdelResults', () => {
		it('should return the bechdel result for a script', () => {
			const title = 'BOYHOOD';
			const scriptPath = path.join(
				__dirname,
				'../../../../scripts/boyhood.txt'
			);

			const expectedResult = {
				pass: false,
				bechdelScore: 0,
				numScenesPass: 0,
				numScenesDontPass: 0,
				numOfFemalesChars: 32,
				numOfMaleChars: 52,
				numOfFemalesCharsWithDialogue: 19,
				numOfMaleCharsWithDialogue: 22,
				totalLinesFemaleDialogue: 493,
				totalLinesMaleDialogue: 459,
				scenesThatPass: [],
			};

			getBechdelResults(title, scriptPath).then(results => {
				expect(results).toMatchObject(expectedResult);
			});
		});
	});
});

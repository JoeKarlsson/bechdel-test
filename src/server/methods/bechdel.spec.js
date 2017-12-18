const path = require('path');
const bechdel = require('./bechdel.js');

jest.mock('./getFilmData/getFilmData');
jest.mock('./script');

describe('Bechdel methods', () => {
	it('should return a module', () => {
		expect(typeof bechdel).toBe('object');
	});

	describe('#getBechdelResults', () => {
		it('should return the bechdel result for a script', () => {
			const title = 'BOYHOOD';
			const scriptPath = path.join(__dirname, '../../../scripts/boyhood.txt');

			const expectedResult = {
				pass: false,
				bechdelScore: 1,
				numScenesPass: 0,
				numScenesDontPass: 161,
				numOfFemalesChars: 0,
				numOfMaleChars: 0,
				numOfFemalesCharsWithDialogue: 0,
				numOfMaleCharsWithDialogue: 0,
				totalLinesFemaleDialogue: 0,
				totalLinesMaleDialogue: 0,
				scenesThatPass: [],
			};

			bechdel.getBechdelResults(title, scriptPath)
				.then((results) => {
					expect(results).toMatchObject(expectedResult);
				});
		});
	});
});

const path = require('path');
const getBechdelResults = require('./bechdel.js');

jest.mock('../getFilmData/getFilmData');
jest.mock('../script');

describe('Bechdel methods', () => {
	it('should return a module', () => {
		expect(typeof getBechdelResults).toBe('function');
	});

	describe('#getBechdelResults', () => {
		it('should return the bechdel result for a script', async () => {
			const title = 'BOYHOOD';
			const scriptPath = path.join(__dirname, '../__mocks__/mock-boyhood.txt');

			const result = await getBechdelResults(title, scriptPath);

			expect(result.pass).toBe(true);
			expect(result.bechdelScore).toBe(3);
			expect(result.numScenesPass).toBe(10);
			expect(result.numScenesDontPass).toBe(151);
			expect(result.numOfFemalesChars).toBe(32);
			expect(result.numOfMaleChars).toBe(52);
			expect(result.numOfFemalesCharsWithDialogue).toBe(19);
			expect(result.numOfMaleCharsWithDialogue).toBe(22);
			expect(result.totalLinesFemaleDialogue).toBe(802);
			expect(result.totalLinesMaleDialogue).toBe(1063);
			expect(result.scenesThatPass.length).toBe(10);
		});
	});
});

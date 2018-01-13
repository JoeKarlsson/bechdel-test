const path = require('path');
const getBechdelResults = require('./getBechdelResults');

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
			expect(result.numScenesPass).toBe(5);
			expect(result.numScenesDontPass).toBe(156);
			expect(result.numOfFemalesChars).toBe(8);
			expect(result.numOfMaleChars).toBe(71);
			expect(result.numOfFemalesCharsWithDialogue).toBe(5);
			expect(result.numOfMaleCharsWithDialogue).toBe(36);
			expect(result.totalLinesFemaleDialogue).toBe(550);
			expect(result.totalLinesMaleDialogue).toBe(1318);
			expect(result.scenesThatPass.length).toBe(5);
		});
	});
});

const BechdelResults = require('./BechdelResults');

describe('Bechdel Results', () => {
	let bechdelResults;

	beforeEach(() => {
		bechdelResults = new BechdelResults();
	});

	describe('inital state', () => {
		it('should be empty', () => {
			expect(bechdelResults.scenesThatPassBechdel).toMatchObject([]);
			expect(bechdelResults.bechdelScore).toBe(0);
			expect(bechdelResults.numScenesPass).toBe(0);
			expect(bechdelResults.numScenesDontPass).toBe(0);
			expect(bechdelResults.numOfFemalesChars).toBe(0);
			expect(bechdelResults.numOfMaleChars).toBe(0);
			expect(bechdelResults.numOfFemalesCharsWithDialogue).toBe(0);
			expect(bechdelResults.numOfMaleCharsWithDialogue).toBe(0);
			expect(bechdelResults.totalLinesFemaleDialogue).toBe(0);
			expect(bechdelResults.totalLinesMaleDialogue).toBe(0);
		});
	});
});

const bechdelResults = require('./BechdelResults');

describe('Bechdel Results', () => {

	beforeEach(() => {
		bechdelResults.reset();
	});

	describe('inital state', () => {
		it('should be empty', () => {
			expect(bechdelResults.bechdelScore).toBe(0);
			expect(bechdelResults.bechdelPass).toBe(false);
			expect(bechdelResults.numScenesPass).toBe(0);
			expect(bechdelResults.numScenesDontPass).toBe(0);
			expect(bechdelResults.numOfFemalesChars).toBe(0);
			expect(bechdelResults.numOfMaleChars).toBe(0);
			expect(bechdelResults.numOfFemalesCharsWithDialogue).toBe(0);
			expect(bechdelResults.numOfMaleCharsWithDialogue).toBe(0);
			expect(bechdelResults.totalLinesFemaleDialogue).toBe(0);
			expect(bechdelResults.totalLinesMaleDialogue).toBe(0);
			expect(bechdelResults.scenesThatPassBechdel).toMatchObject([]);
		});
	});

	describe('bechdelScore', () => {
		it('should increment bechdelScore by one', () => {
			expect(bechdelResults.bechdelScore).toBe(0);
			expect(bechdelResults.bechdelPass).toBe(false);
			bechdelResults.bechdelScore = 1;
			expect(bechdelResults.bechdelScore).toBe(1);
			expect(bechdelResults.bechdelPass).toBe(false);
			bechdelResults.bechdelScore = 2;
			expect(bechdelResults.bechdelScore).toBe(2);
			expect(bechdelResults.bechdelPass).toBe(false);
			bechdelResults.bechdelScore = 3;
			expect(bechdelResults.bechdelScore).toBe(3);
			expect(bechdelResults.bechdelPass).toBe(true);
			bechdelResults.bechdelScore = 3;
			expect(bechdelResults.bechdelScore).toBe(3);
			expect(bechdelResults.bechdelPass).toBe(true);
		});
	});

	describe('numScenesPass', () => {
		it('should increment numScenesPass by one', () => {
			expect(bechdelResults.numScenesPass).toBe(0);
			bechdelResults.numScenesPassIncrement();
			expect(bechdelResults.numScenesPass).toBe(1);
			bechdelResults.numScenesPassIncrement();
			expect(bechdelResults.numScenesPass).toBe(2);
			bechdelResults.numScenesPassIncrement();
			expect(bechdelResults.numScenesPass).toBe(3);
			bechdelResults.numScenesPassIncrement();
			expect(bechdelResults.numScenesPass).toBe(4);
		});
	});

	describe('numScenesDontPass', () => {
		it('should increment numScenesDontPass by one', () => {
			expect(bechdelResults.numScenesDontPass).toBe(0);
			bechdelResults.numScenesDontPassIncrement();
			expect(bechdelResults.numScenesDontPass).toBe(1);
			bechdelResults.numScenesDontPassIncrement();
			expect(bechdelResults.numScenesDontPass).toBe(2);
			bechdelResults.numScenesDontPassIncrement();
			expect(bechdelResults.numScenesDontPass).toBe(3);
			bechdelResults.numScenesDontPassIncrement();
			expect(bechdelResults.numScenesDontPass).toBe(4);
		});
	});

	describe('numOfFemalesChars', () => {
		it('should increment numOfFemalesChars by one', () => {
			expect(bechdelResults.numOfFemalesChars).toBe(0);
			bechdelResults.numOfFemalesCharsIncrement();
			expect(bechdelResults.numOfFemalesChars).toBe(1);
			bechdelResults.numOfFemalesCharsIncrement();
			expect(bechdelResults.numOfFemalesChars).toBe(2);
			bechdelResults.numOfFemalesCharsIncrement();
			expect(bechdelResults.numOfFemalesChars).toBe(3);
			bechdelResults.numOfFemalesCharsIncrement();
			expect(bechdelResults.numOfFemalesChars).toBe(4);
		});
	});

	describe('numOfMaleChars', () => {
		it('should increment numOfMaleChars by one', () => {
			expect(bechdelResults.numOfMaleChars).toBe(0);
			bechdelResults.numOfMaleCharsIncrement();
			expect(bechdelResults.numOfMaleChars).toBe(1);
			bechdelResults.numOfMaleCharsIncrement();
			expect(bechdelResults.numOfMaleChars).toBe(2);
			bechdelResults.numOfMaleCharsIncrement();
			expect(bechdelResults.numOfMaleChars).toBe(3);
			bechdelResults.numOfMaleCharsIncrement();
			expect(bechdelResults.numOfMaleChars).toBe(4);
		});
	});

	describe('numOfFemalesCharsWithDialogue', () => {
		it('should increment numOfFemalesCharsWithDialogue by one', () => {
			expect(bechdelResults.numOfFemalesCharsWithDialogue).toBe(0);
			bechdelResults.numOfFemalesCharsWithDialogueIncrement();
			expect(bechdelResults.numOfFemalesCharsWithDialogue).toBe(1);
			bechdelResults.numOfFemalesCharsWithDialogueIncrement();
			expect(bechdelResults.numOfFemalesCharsWithDialogue).toBe(2);
			bechdelResults.numOfFemalesCharsWithDialogueIncrement();
			expect(bechdelResults.numOfFemalesCharsWithDialogue).toBe(3);
			bechdelResults.numOfFemalesCharsWithDialogueIncrement();
			expect(bechdelResults.numOfFemalesCharsWithDialogue).toBe(4);
		});
	});

	describe('numOfMaleCharsWithDialogue', () => {
		it('should increment numOfMaleCharsWithDialogue by one', () => {
			expect(bechdelResults.numOfMaleCharsWithDialogue).toBe(0);
			bechdelResults.numOfMaleCharsWithDialogueIncrement();
			expect(bechdelResults.numOfMaleCharsWithDialogue).toBe(1);
			bechdelResults.numOfMaleCharsWithDialogueIncrement();
			expect(bechdelResults.numOfMaleCharsWithDialogue).toBe(2);
			bechdelResults.numOfMaleCharsWithDialogueIncrement();
			expect(bechdelResults.numOfMaleCharsWithDialogue).toBe(3);
			bechdelResults.numOfMaleCharsWithDialogueIncrement();
			expect(bechdelResults.numOfMaleCharsWithDialogue).toBe(4);
		});
	});

	describe('totalLinesFemaleDialogue', () => {
		it('should increment totalLinesFemaleDialogue by one', () => {
			expect(bechdelResults.totalLinesFemaleDialogue).toBe(0);
			bechdelResults.totalLinesFemaleDialogueIncrement();
			expect(bechdelResults.totalLinesFemaleDialogue).toBe(1);
			bechdelResults.totalLinesFemaleDialogueIncrement();
			expect(bechdelResults.totalLinesFemaleDialogue).toBe(2);
			bechdelResults.totalLinesFemaleDialogueIncrement();
			expect(bechdelResults.totalLinesFemaleDialogue).toBe(3);
			bechdelResults.totalLinesFemaleDialogueIncrement();
			expect(bechdelResults.totalLinesFemaleDialogue).toBe(4);
		});
	});

	describe('totalLinesMaleDialogue', () => {
		it('should increment totalLinesMaleDialogue by one', () => {
			expect(bechdelResults.totalLinesMaleDialogue).toBe(0);
			bechdelResults.totalLinesMaleDialogueIncrement();
			expect(bechdelResults.totalLinesMaleDialogue).toBe(1);
			bechdelResults.totalLinesMaleDialogueIncrement();
			expect(bechdelResults.totalLinesMaleDialogue).toBe(2);
			bechdelResults.totalLinesMaleDialogueIncrement();
			expect(bechdelResults.totalLinesMaleDialogue).toBe(3);
			bechdelResults.totalLinesMaleDialogueIncrement();
			expect(bechdelResults.totalLinesMaleDialogue).toBe(4);
		});
	});

	describe('scenesThatPassBechdel', () => {
		it('should add a new scene array', () => {
			expect(bechdelResults.scenesThatPassBechdel).toMatchObject([]);
			bechdelResults.addBechdelPassingScene('test scene');
			expect(bechdelResults.scenesThatPassBechdel).toMatchObject(['test scene']);
		});
	});

});

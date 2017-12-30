class BechdelResults {
	constructor() {
		this._pass = false;
		this._bechdelScore = 0;
		this._numScenesPass = 0;
		this._numScenesDontPass = 0;
		this._numOfFemalesChars = 0;
		this._numOfMaleChars = 0;
		this._numOfFemalesCharsWithDialogue = 0;
		this._numOfMaleCharsWithDialogue = 0;
		this._totalLinesFemaleDialogue = 0;
		this._totalLinesMaleDialogue = 0;
		this._characters = [];
		this._scenesThatPass = [];
		this._scenes = [];
	}

	get bechdelPass() {
		return this._pass;
	}

	set bechdelPass(passed) {
		this._pass = passed;
		return this._pass;
	}

	get bechdelScore() {
		return this._bechdelScore;
	}

	set bechdelScore(score) {
		if (score >= 3) {
			this._bechdelScore = 3;
		}
		if (this._bechdelScore === 3) {
			this._pass = true;
			return this._bechdelScore;
		}
		this._bechdelScore = score;
		return this._bechdelScore;
	}

	get numScenesPass() {
		return this._numScenesPass;
	}

	numScenesPassIncrement() {
		return this._numScenesPass++;
	}

	get numScenesDontPass() {
		return this._numScenesDontPass;
	}

	numScenesDontPassIncrement() {
		return this._numScenesDontPass++;
	}

	get numOfFemalesChars() {
		return this._numOfFemalesChars;
	}

	numOfFemalesCharsIncrement() {
		return this._numOfFemalesChars++;
	}

	get numOfMaleChars() {
		return this._numOfMaleChars;
	}

	numOfMaleCharsIncrement() {
		return this._numOfMaleChars++;
	}

	get numOfFemalesCharsWithDialogue() {
		return this._numOfFemalesCharsWithDialogue;
	}

	numOfFemalesCharsWithDialogueIncrement() {
		return this._numOfFemalesCharsWithDialogue++;
	}

	get numOfMaleCharsWithDialogue() {
		return this._numOfMaleCharsWithDialogue;
	}

	numOfMaleCharsWithDialogueIncrement() {
		return this._numOfMaleCharsWithDialogue++;
	}

	get totalLinesFemaleDialogue() {
		return this._totalLinesFemaleDialogue;
	}

	totalLinesFemaleDialogueIncrement() {
		return this._totalLinesFemaleDialogue++;
	}

	totalLinesFemaleDialogueAdd(count) {
		this._totalLinesFemaleDialogue += count;
		return this._totalLinesFemaleDialogue;
	}

	get totalLinesMaleDialogue() {
		return this._totalLinesMaleDialogue;
	}

	totalLinesMaleDialogueIncrement() {
		return this._totalLinesMaleDialogue++;
	}

	totalLinesMaleDialogueAdd(count) {
		this._totalLinesMaleDialogue += count;
		return this._totalLinesMaleDialogue;
	}

	get scenesThatPassBechdel() {
		return this._scenesThatPass;
	}

	addBechdelPassingScene(scene) {
		this._scenesThatPass.push(scene);
		return this._scenesThatPass;
	}

	get characters() {
		return this._characters;
	}

	set characters(characters) {
		this._characters = characters;
		return this._characters;
	}

	addCharacter(character) {
		this._characters.push(character);
		return this._characters;
	}

	get scenes() {
		return this._scenes;
	}

	addScene(scene) {
		this._scenes.push(scene);
		return this._scenes;
	}

	getBechdelResults() {
		return {
			pass: this._pass,
			bechdelScore: this._bechdelScore,
			numScenesPass: this._numScenesPass,
			numScenesDontPass: this._numScenesDontPass,
			numOfFemalesChars: this._numOfFemalesChars,
			numOfMaleChars: this._numOfMaleChars,
			numOfFemalesCharsWithDialogue: this._numOfFemalesCharsWithDialogue,
			numOfMaleCharsWithDialogue: this._numOfMaleCharsWithDialogue,
			totalLinesFemaleDialogue: this._totalLinesFemaleDialogue,
			totalLinesMaleDialogue: this._totalLinesMaleDialogue,
			characters: this._characters,
			scenesThatPass: this._scenesThatPass,
			// scenes: this._scenes,
		};
	}

	reset() {
		this._pass = false;
		this._bechdelScore = 0;
		this._numScenesPass = 0;
		this._numScenesDontPass = 0;
		this._numOfFemalesChars = 0;
		this._numOfMaleChars = 0;
		this._numOfFemalesCharsWithDialogue = 0;
		this._numOfMaleCharsWithDialogue = 0;
		this._totalLinesFemaleDialogue = 0;
		this._totalLinesMaleDialogue = 0;
		this._characters = [];
		this._scenesThatPass = [];
		this._scenes = [];

		return true;
	}
}

const bechdelResults = new BechdelResults();

module.exports = bechdelResults;

class BechdelResults {
	constructor() {
		this._bechdelScore = 0;
		this._numScenesPass = 0;
		this._numScenesDontPass = 0;
		this._numOfFemalesChars = 0;
		this._numOfMaleChars = 0;
		this._numOfFemalesCharsWithDialogue = 0;
		this._numOfMaleCharsWithDialogue = 0;
		this._totalLinesFemaleDialogue = 0;
		this._totalLinesMaleDialogue = 0;
		this._scenesThatPass = [];
	}

	get bechdelScore() {
		return this._bechdelScore;
	}

	set bechdelScore(score) {
		if (score < 0 || score > 3) {
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
		return this._numScenesPass;
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

	get totalLinesMaleDialogue() {
		return this._totalLinesMaleDialogue;
	}

	totalLinesMaleDialogueIncrement() {
		return this._totalLinesMaleDialogue++;
	}

	get scenesThatPassBechdel() {
		return this._scenesThatPass;
	}

	addBechdelPassingScene(scene) {
		this._scenesThatPass.push(scene);
		return this._scenesThatPass;
	}
}

module.exports = BechdelResults;

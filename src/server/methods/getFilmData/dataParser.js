const filmData = require('./FilmData');
const handleError = require('../../helper/handleError');

const isFullCast = type => {
	if (type === 'fullCast') {
		return true;
	}
	return false;
};

const cleanCharName = name => {
	return name.replace(/'([^']+(?='))'/g, '$1').toUpperCase();
};

const isValidArr = arr => {
	return arr.length !== 0;
};

const isNotValidArr = arr => {
	return !isValidArr(arr);
};

const createCharcArr = (rawCharacters, type) => {
	const processedCharArr = [];

	for (let i = 0; i < rawCharacters.length; i++) {
		const characterName = cleanCharName(rawCharacters[i].character);

		processedCharArr.push({
			actorName: rawCharacters[i].actorName,
			gender: rawCharacters[i].biography.actorActress,
			characterName,
			mainCast: isFullCast(type),
		});
	}
	return processedCharArr;
};

const dataParser = (rawCharacters, type) => {
	let processedCharArr;

	if (isValidArr(rawCharacters)) {
		processedCharArr = createCharcArr(rawCharacters, type);
	} else {
		handleError('Error: Connected to myfilmapi, but no actor data returned');
	}

	filmData.addActor(processedCharArr);
	if (isNotValidArr(processedCharArr)) {
		handleError('Error when parsing char arr');
	}

	return processedCharArr;
};

module.exports = dataParser;

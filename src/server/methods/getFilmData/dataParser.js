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

const createCharcArr = (rawCharacters, type) => {
	const processedCharArr = [];

	for (let i = 0; i < rawCharacters.length; i++) {
		const characterName = cleanCharName(rawCharacters[i].character);
		console.log(characterName);

		processedCharArr.push({
			actorName: rawCharacters[i].actorName,
			gender: rawCharacters[i].biography.actorActress,
			characterName,
			mainCast: isFullCast(type),
		});
	}
	console.log(processedCharArr, '1');
	return processedCharArr;
};

const dataParser = (rawCharacters, type) => {
	let processedCharArr;

	if (isValidArr(rawCharacters)) {
		console.log('hit');
		processedCharArr = createCharcArr(rawCharacters, type);
		console.log(processedCharArr, '2');
	} else {
		handleError('Error: Connected to myfilmapi, but no actor data returned');
	}
	filmData.addActor(processedCharArr);
	if (isValidArr(rawCharacters)) {
		handleError('Error when parsing char arr');
	}

	return processedCharArr;
};

module.exports = dataParser;

const handleError = require('../../helper/handleError');

const cleanCharName = name => {
	return name.replace(/'([^']+(?='))'/g, '$1').toUpperCase();
};

const isValidArr = arr => {
	return arr.length !== 0;
};

const isNotValidArr = arr => {
	return !isValidArr(arr);
};

const createCharcArr = rawCharacters => {
	const processedCharArr = [];

	for (let i = 0; i < rawCharacters.length; i++) {
		const { character, gender, name, order, profile_path } = rawCharacters[i]; // eslint-disable-line camelcase

		const characterName = cleanCharName(character);

		processedCharArr.push({
			gender,
			character,
			name,
			order,
			profile_path,
			cleanCharName: characterName,
		});
	}
	return processedCharArr;
};

const dataParser = rawCharacters => {
	let processedCharArr;

	if (isValidArr(rawCharacters)) {
		processedCharArr = createCharcArr(rawCharacters);
	} else {
		handleError('Error: Connected to api, but no actor data returned');
	}

	if (isNotValidArr(processedCharArr)) {
		handleError('Error when parsing char arr');
	}
	return processedCharArr;
};

module.exports = dataParser;

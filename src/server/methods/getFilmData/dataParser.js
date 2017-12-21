const filmData = require('./FilmData');

const isFullCast = type => {
	if (type === 'fullCast') {
		return true;
	}
	return false;
};

const cleanCharName = name => {
	return name.replace(/'([^']+(?='))'/g, '$1').toUpperCase();
};

const createCharcArr = (arr, characters, type) => {
	for (let i = 0; i < characters.length; i++) {
		const characterName = cleanCharName(characters[i].character);

		arr.push({
			actorName: characters[i].actorName,
			gender: characters[i].biography.actorActress,
			characterName,
			mainCast: isFullCast(type),
		});
	}
	return arr;
};

const dataParser = (body, type) => {
	const rawMovieCharacters = body.data.movies[0].actors;
	let movieCharacters = [];

	if (rawMovieCharacters !== []) {
		movieCharacters = createCharcArr(movieCharacters, rawMovieCharacters, type);
	} else {
		throw new Error(
			'Error: Connected to myfilmapi, but no actor data returned',
		);
	}
	filmData.addActor(movieCharacters);
	return movieCharacters;
};

module.exports = dataParser;

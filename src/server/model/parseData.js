const parseActorArr = arr => {
	if (!arr) {
		throw new Error('Cannot parseActorArr');
	}
	const actorsArr = [];
	let i;
	for (i = 0; i < arr.length; i++) {
		const actor = {};
		actor.actorName = arr[i].actorName || arr[i].name;
		actor.character = arr[i].character;
		actor.actorActress = arr[i].gender || arr[i].actorActress;
		actorsArr.push(actor);
	}
	return actorsArr;
};

const parseImageData = images => {
	if (!images) {
		throw new Error('Cannot parseImageData');
	}
	const img = {};

	// Handle different image data structures
	if (images.backdrops && Array.isArray(images.backdrops) && images.backdrops.length > 0) {
		// If backdrops is an array of objects with file_path
		if (typeof images.backdrops[0] === 'object' && images.backdrops[0].file_path) {
			img.backdrop = `https://image.tmdb.org/t/p/original${images.backdrops[0].file_path}`;
		}
		// If backdrops is an array of URLs
		else if (typeof images.backdrops[0] === 'string') {
			img.backdrop = images.backdrops[0];
		}
	}
	// If images already has backdrop URL
	else if (images.backdrop) {
		img.backdrop = images.backdrop;
	}
	else {
		img.backdrop = ''; // Default empty string
	}

	if (images.posters && Array.isArray(images.posters) && images.posters.length > 0) {
		// If posters is an array of objects with file_path
		if (typeof images.posters[0] === 'object' && images.posters[0].file_path) {
			img.poster = `https://image.tmdb.org/t/p/w300${images.posters[0].file_path}`;
		}
		// If posters is an array of URLs
		else if (typeof images.posters[0] === 'string') {
			img.poster = images.posters[0];
		}
	}
	// If images already has poster URL
	else if (images.poster) {
		img.poster = images.poster;
	}
	else {
		img.poster = ''; // Default empty string
	}

	return img;
};

module.exports = {
	parseActorArr,
	parseImageData,
};

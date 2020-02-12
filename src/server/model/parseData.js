const parseActorArr = arr => {
	if (!arr) {
		throw new Error('Cannot parseActorArr');
	}
	const actorsArr = [];
	let i;
	for (i = 0; i < arr.length; i++) {
		const actor = {};
		actor.actorName = arr[i].actorName;
		actor.character = arr[i].character;
		actor.actorActress = arr[i].gender;
		actorsArr.push(actor);
	}
	return actorsArr;
};

const parseImageData = images => {
	if (!images) {
		throw new Error('Cannot parseImageData');
	}
	const img = {};
	img.backdrop = `https://image.tmdb.org/t/p/original${images.backdrops[0].file_path}`;
	img.poster = `https://image.tmdb.org/t/p/w300${images.posters[0].file_path}`;
	return img;
};

module.exports = {
	parseActorArr,
	parseImageData,
};

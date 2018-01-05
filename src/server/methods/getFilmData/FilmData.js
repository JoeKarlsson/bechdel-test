const mergeObj = (obj, src) => {
	return Object.assign(src, obj);
};

const mergeArr = (arr, src) => {
	const newArr = [...src];
	let isUnique = true;

	for (let i = 0; i < arr.length; i++) {
		for (let j = 0; j < src.length; j++) {
			if (arr[i].character === src[j].character) {
				isUnique = false;
				break;
			}
		}
		if (isUnique) {
			newArr.push(arr[i]);
		}
		isUnique = true;
	}
	return newArr;
};

class FilmData {
	constructor() {
		this._actors = [];
		this._images = {};
		this._metadata = {};
		this._imdbID = null;
	}

	get actors() {
		return this._actors;
	}

	addActor(actors) {
		this._actors = mergeArr(actors, this._actors);
		return this._actors;
	}

	get images() {
		return this._images;
	}

	set images(imgs) {
		this._images = imgs;
		return this._images;
	}

	get metaData() {
		return this._metadata;
	}

	addMetaData(data) {
		const newObj = mergeObj(data, this._metadata);
		this._metadata = newObj;

		return this._metadata;
	}

	get imdbID() {
		return this._imdbID;
	}

	set imdbID(newImdbID) {
		this._imdbID = newImdbID;
		return this._imdbID;
	}

	getAllData() {
		return {
			actors: this._actors,
			images: this._images,
			metadata: this._metadata,
			imdbID: this._imdbID,
		};
	}

	clear() {
		this._actors = [];
		this._images = {};
		this._metadata = {};
		this._imdbID = null;

		return {
			actors: this._actors,
			images: this._images,
			metadata: this._metadata,
			imdbID: this._imdbID,
		};
	}
}

const filmData = new FilmData();

module.exports = filmData;

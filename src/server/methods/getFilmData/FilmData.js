const merge = require('./merge');

const { mergeArr, mergeObj } = merge;

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

	addActors(actors) {
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

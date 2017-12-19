class FilmData {
	constructor() {
		this._actors = [];
		this._images = {};
		this._metadata = [];
		this._imdbID = null;
	}

	get actors() {
		return this._actors;
	}

	addActor(actors) {
		const arr = [...this._actors, ...actors];
		this._actors = arr;
		console.log('actors', actors);
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
		this._metadata.push(data);
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
		};
	}

	clear() {
		this._actors = [];
		this._images = {};
		this._metadata = [];
		return {
			actors: this._actors,
			images: this._images,
			metadata: this._metadata,
		};
	}
}

const filmData = new FilmData();

module.exports = filmData;

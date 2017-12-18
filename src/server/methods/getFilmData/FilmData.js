class FilmData {
	constructor() {
		this._actors = [];
		this._images = {};
		this._metadata = [];
	}

	get actors() {
		return this._actors;
	}

	addActor(actor) {
		this._actors.push(actor);
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
	}
}

module.exports = FilmData;

const filmSchema = {
	title: {
		type: String,
		required: true,
	},
	plot: String,
	simplePlot: String,
	year: Number,
	releaseDate: String,
	actors: [
		{
			actorName: String,
			character: String,
			actorActress: String,
		},
	],
	directors: [
		{
			name: String,
			id: String,
		},
	],
	writers: [
		{
			name: String,
			id: String,
		},
	],
	awards: [
		{
			name: String,
			id: String,
		},
	],
	rated: String,
	genres: [String],
	urlPoster: String,
	idIMDB: String,
	urlIMDB: String,
	rating: String,
	metascore: Number,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	bechdelResults: {
		pass: Boolean,
		bechdelScore: Number,
		numScenesPass: Number,
		numScenesDontPass: Number,
		numOfFemalesChars: Number,
		numOfMaleChars: Number,
		numOfFemalesCharsWithDialogue: Number,
		numOfMaleCharsWithDialogue: Number,
		totalLinesFemaleDialogue: Number,
		totalLinesMaleDialogue: Number,
	},
	images: {
		backdrop: String,
		poster: String,
	},
	bechdelData: {
		visible: Number,
		dubious: Number,
		submitterid: Number,
		rating: Number,
		year: Number,
		id: Number,
		imdbid: Number,
		title: String,
	},
};

module.exports = filmSchema;

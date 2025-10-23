const filmSchema = {
	title: {
		type: String,
		required: true,
		unique: true,
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
	dateUploaded: {
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
		scenesThatPass: [String],
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
	enhancedAnalytics: {
		femaleAgency: Object,
		stereotypes: Object,
		intersectionality: Object,
		sentiment: Object,
		topics: Object,
		powerDynamics: Object,
		vocabulary: Object,
		biasDetection: Object,
		improvements: Object,
		characterDevelopment: Object,
		enhancedBechdelValidation: {
			scenesAnalyzed: Number,
			scenes: [Object],
			overallAssessment: {
				keywordTestScore: Number,
				llmRecommendedScore: Number,
				llmPass: Boolean,
				falsePositivesDetected: Number,
				reasoning: String
			},
			recommendations: String
		},
		analysisTimestamp: String,
		scriptOptimization: {
			tokenReduction: {
				original: Number,
				cleaned: Number,
				condensed: Number,
				reductionPercentage: Number
			}
		},
		characterDialogue: [Object],
		keyScenes: [Object]
	},
	analyticsSummary: {
		overallScore: Number,
		keyMetrics: {
			femaleAgencyScore: Number,
			stereotypeScore: Number,
			diversityScore: Number,
			powerDynamicsScore: Number,
			biasScore: Number
		},
		recommendations: [String],
		tokenOptimization: Object
	},
	analysisMetadata: {
		analysisTimestamp: String,
		processId: String,
		scriptPath: String,
		characterCount: Number,
		femaleCharacterCount: Number,
		maleCharacterCount: Number
	},
};

module.exports = filmSchema;

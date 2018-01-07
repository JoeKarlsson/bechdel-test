const script = require('../script');
const scriptAnalysis = require('./scriptAnalysis/scriptAnalysis');
const bechdelResults = require('./BechdelResults');
const extractScenes = require('./extractScenes');
const getFilmData = require('../getFilmData/getFilmData');
const handleError = require('../../helper/handleError');

const getBechdelResults = async (title, path) => {
	try {
		const data = await getFilmData(title);
		console.log(data, 'all data complete');

		const movieScript = await script.read(path);

		scriptAnalysis.scriptGenderAnalytics(
			bechdelResults.characters,
			movieScript
		);
		const scenes = extractScenes(movieScript);
		const analysis = scriptAnalysis.scriptAnalysis(
			bechdelResults.characters,
			scenes
		);

		return analysis;
	} catch (error) {
		handleError(error);
	}
};

module.exports = getBechdelResults;

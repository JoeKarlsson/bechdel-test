const script = require('../script');
const scriptAnalysis = require('./scriptAnalysis/scriptAnalysis');
const bechdelResults = require('./BechdelResults');
const extractScenes = require('./extractScenes');
const getFilmData = require('../getFilmData/getFilmData');
const handleError = require('../../helper/handleError');

const getBechdelResults = async (title, path) => {
	try {
		const data = await getFilmData(title);

		bechdelResults.characters = data.actors;

		const movieScript = await script.read(path);

		scriptAnalysis.scriptGenderAnalytics(
			bechdelResults.characters,
			movieScript
		);
		const scenes = extractScenes(movieScript);
		return scriptAnalysis.scriptAnalysis(bechdelResults.characters, scenes);
	} catch (err) {
		handleError(err);
	}
};

module.exports = getBechdelResults;

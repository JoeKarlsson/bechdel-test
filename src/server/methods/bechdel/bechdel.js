const script = require('../script');
const scriptAnalysis = require('./scriptAnalysis/scriptAnalysis');
const bechdelResults = require('./BechdelResults');
const extractScenes = require('./extractScenes');
const getFilmData = require('../getFilmData/getFilmData');

const getBechdelResults = async (title, path) => {
	return new Promise((resolve, reject) => {
		return getFilmData(title)
			.then(data => {
				bechdelResults.characters = data.actors;
				return script.read(path);
			})
			.then(movieScript => {
				scriptAnalysis.scriptGenderAnalytics(
					bechdelResults.characters,
					movieScript
				);
				const scenes = extractScenes(movieScript);
				scriptAnalysis
					.scriptAnalysis(bechdelResults.characters, scenes)
					.then(analysis => {
						resolve(analysis);
					})
					.catch(error => {
						reject(new Error(error));
					});
			})
			.catch(error => {
				reject(new Error(error));
			});
	});
};

module.exports = getBechdelResults;

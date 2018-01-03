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
				console.log('film data aquired');
				scriptAnalysis.scriptGenderAnalytics(
					bechdelResults.characters,
					movieScript
				);
				console.log('gender analytics complete');
				const scenes = extractScenes(movieScript);
				console.log('scenes extracted');
				scriptAnalysis
					.scriptAnalysis(bechdelResults.characters, scenes)
					.then(analysis => {
						console.log('scriptAnalysis complete');
						console.log(analysis, 'analysis');
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

const path = require('path');
const processScript = require('../methods/processScript');
// const scriptFile = require('../../../scripts/alien.txt');

const extractTitle = file => {
	const title = path.parse(file).name;
	return title;
};

const processScriptServerSide = async () => {
	const scriptPath = 'scripts/alien.txt';

	const title = extractTitle(scriptPath);
	const result = await processScript(scriptPath, title);
	console.log(result);
};

try {
	processScriptServerSide();
} catch (err) {
	console.error(err);
}

const handleError = errMsg => {
	console.error(errMsg);
	throw new Error(errMsg);
};

module.exports = handleError;

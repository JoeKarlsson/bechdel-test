const handleListen = (port, log) => {
	log(
		`==> 🌎 Listening on port ${port}. ` +
				`Open up http://localhost:${port}/ in your browser.`,
	);
};

module.exports = handleListen;

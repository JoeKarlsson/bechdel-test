const webpackDevConfig = require('./webpackDevConfig');

describe('webpackDevConfig', () => {
	it('should be a function', () => {
		expect(typeof webpackDevConfig).toBe('object');
	});
});

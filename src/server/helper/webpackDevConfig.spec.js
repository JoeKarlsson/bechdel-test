const webpackDevConfig = require('./webpackDevConfig');

describe('webpackDevConfig', () => {
	it('should export webpack dev config', () => {
		expect(webpackDevConfig).toBeDefined();
		expect(typeof webpackDevConfig).toBe('object');
	});

	it('should have required webpack properties', () => {
		expect(webpackDevConfig).toHaveProperty('entry');
		expect(webpackDevConfig).toHaveProperty('mode');
		expect(webpackDevConfig.mode).toBe('development');
	});
});

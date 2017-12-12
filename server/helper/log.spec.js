const log = require('./log');

describe('Log', () => {
	it('should be a function', () => {
		expect(typeof log).toBe('function');
	});

	it('should console log our msg', () => {
		expect(log('test')).toBe(undefined);
	});
});

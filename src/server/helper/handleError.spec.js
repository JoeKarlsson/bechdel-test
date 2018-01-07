const handleError = require('./handleError');

describe('handleError', () => {
	const testErrMsg = 'test err message';

	const errWrapper = () => {
		return handleError(testErrMsg);
	};

	it('should be a function', () => {
		expect(typeof handleError).toBe('function');
	});

	it('should console error our msg', () => {
		expect(errWrapper).toThrow(Error);
		expect(errWrapper).toThrow(testErrMsg);
	});
});

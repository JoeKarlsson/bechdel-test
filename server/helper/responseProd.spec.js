const prodResponse = require('./responseProd');

describe('devResponse', () => {
	it('should be a function', () => {
		expect(typeof prodResponse).toBe('function');
	});
});

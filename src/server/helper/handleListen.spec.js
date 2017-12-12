const handleListen = require('./handleListen');

describe('handleListen', () => {
	it('should be a function', () => {
		expect(typeof handleListen).toBe('function');
	});

	it('should console log our msg', () => {
		const mockFunction = jest.fn();
		expect(handleListen(6969, mockFunction)).toBe(undefined);
	});

	it('should invoke our log function', () => {
		const mockFunction = jest.fn();
		handleListen(6969, mockFunction);
		expect(mockFunction).toHaveBeenCalled();
	});
});

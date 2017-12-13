import DEFAULT_ERROR_MESSAGE from './constants';

describe('Constants', () => {
	describe('DEFAULT_ERROR_MESSAGE', () => {
		it('should match the default error message', () => {
			expect(DEFAULT_ERROR_MESSAGE).toBe('Sorry, something went wrong. Please try again.');
		});
	});
});

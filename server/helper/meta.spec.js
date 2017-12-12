const meta = require('./meta');

describe('Meta', () => {
	describe('isDeveloping', () => {
		it('should return the correct ENV', () => {
			expect(meta.isDeveloping).toBe(true);
		});
	});

	describe('isTest', () => {
		it('should return the correct ENV', () => {
			expect(meta.isTest).toBe(true);
		});
	});

	describe('port', () => {
		it('should return the correct PORT', () => {
			expect(meta.port).toBe(3000);
		});
	});
});

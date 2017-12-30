const scriptAnalysis = require('./scriptAnalysis');

describe('Script Analysis methods', () => {
	it('should return a module', () => {
		expect(typeof scriptAnalysis).toBe('object');
	});

	describe('#scriptAnalysis', () => {
		it('should return the bechdel result for a script', async () => {
			// const chars = [];
			// const scenes = [];
			// const results = await scriptAnalysis.scriptAnalysis(chars, scenes);
			// console.log(results);
		});
	});
});

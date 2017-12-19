const path = require('path');
const script = require('./script.js');

jest.mock('fs');

describe('Script methods', () => {
	describe('#readMovieTitle', () => {
		it('should read a script and return the title', () => {
			const scriptPath = path.join(__dirname, '../../../scripts/boyhood.txt');
			script
				.readMovieTitle(scriptPath)
				.then((title) => {
					expect(title).toBe('BOYHOOD');
				})
				.catch((err) => {
					console.error('err', err);
				});
		});
	});

	describe('#read', () => {
		it('should read a script', () => {
			const scriptPath = path.join(__dirname, 'test-script.txt');
			script
				.read(scriptPath)
				.then((scriptBody) => {
					expect(typeof scriptBody).toBe('string');
					expect(scriptBody.length).toBeGreaterThan(0);
				})
				.catch((err) => {
					console.error('err', err);
				});
		});
	});

	describe('#clearTemp', () => {
		it('should return true after success', () => {
			script.clearTemp('/path/to/file').then((result) => {
				expect(result).toBe(true);
			});
		});
	});
});

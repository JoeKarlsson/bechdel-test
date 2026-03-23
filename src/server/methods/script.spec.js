const path = require('path');
const script = require('./script.js');

jest.mock('fs', () => ({
	createReadStream: jest.fn(() => ({
		on: jest.fn().mockImplementation(function(event, handler) {
			if (event === 'data') handler('test content');
			if (event === 'close') setTimeout(() => handler(), 0);
			return this;
		}),
	})),
	unlink: jest.fn((filePath, callback) => callback(null)),
}));

describe('Script methods', () => {
	describe('#readMovieTitle', () => {
		it('should read a script and return the title', () => {
			const scriptPath = path.join(process.cwd(), 'scripts/boyhood.txt');
			const title = script.readMovieTitle(scriptPath);
			expect(title).toBe('boyhood');
		});
	});

	describe('#read', () => {
		it('should reject paths outside allowed directories', async () => {
			const scriptPath = '/etc/passwd';
			await expect(script.read(scriptPath)).rejects.toThrow('Access denied');
		});

		it('should reject invalid input', async () => {
			await expect(script.read(null)).rejects.toThrow('Invalid read input');
		});
	});

	describe('#clearTemp', () => {
		it('should reject paths outside allowed directories', async () => {
			await expect(script.clearTemp('/path/to/file')).rejects.toThrow('Access denied');
		});

		it('should reject invalid input', async () => {
			await expect(script.clearTemp(null)).rejects.toThrow('Invalid clearTemp input');
		});
	});
});

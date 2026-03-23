/* eslint-disable guard-for-in, no-cond-assign, no-restricted-syntax */
const fs = require('fs');
const path = require('path');

// Allowed directories for script file operations
const ALLOWED_DIRECTORIES = [
	path.resolve(process.cwd(), 'uploads'),
	path.resolve(process.cwd(), 'scripts'),
];

/**
 * Validates that a file path is within allowed directories to prevent path traversal attacks
 * @param {string} filePath - The file path to validate
 * @returns {boolean} True if path is safe, false otherwise
 */
const isPathSafe = (filePath) => {
	if (!filePath || typeof filePath !== 'string') {
		return false;
	}

	// Resolve to absolute path and normalize
	const resolvedPath = path.resolve(filePath);

	// Check if path is within any allowed directory
	return ALLOWED_DIRECTORIES.some(allowedDir => {
		const normalizedAllowed = path.resolve(allowedDir);
		return resolvedPath.startsWith(normalizedAllowed + path.sep) || resolvedPath === normalizedAllowed;
	});
};

const readMovieTitle = scriptPath => {
	const title = path.basename(scriptPath, '.txt');
	console.log('title', title);
	return title;
};

const read = filePath => {
	const promise = new Promise((resolve, reject) => {
		if (!filePath) {
			reject(new Error('Invalid read input'));
			return;
		}

		// Validate path is within allowed directories
		if (!isPathSafe(filePath)) {
			reject(new Error('Access denied: path is outside allowed directories'));
			return;
		}

		const rs = fs.createReadStream(filePath, { encoding: 'utf8' });
		let movieScript = '';

		rs
			.on('data', chunk => {
				movieScript += chunk;
			})
			.on('close', () => {
				resolve(movieScript);
			})
			.on('error', err => {
				reject(new Error(err));
			});
	});
	return promise;
};

const clearTemp = filePath => {
	const promise = new Promise((resolve, reject) => {
		if (!filePath) {
			reject(new Error('Invalid clearTemp input'));
			return;
		}

		// Validate path is within allowed directories
		if (!isPathSafe(filePath)) {
			reject(new Error('Access denied: path is outside allowed directories'));
			return;
		}

		fs.unlink(filePath, err => {
			if (err) {
				console.error('Error clearing temp file');
			}
			resolve(true);
		});
	});
	return promise;
};

module.exports = {
	readMovieTitle,
	read,
	clearTemp,
};

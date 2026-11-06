module.exports = {
	testEnvironment: 'node',
	// site/ is the separate Astro project with its own node:test and Playwright suites
	testPathIgnorePatterns: ['/node_modules/', '<rootDir>/site/'],
	modulePathIgnorePatterns: ['<rootDir>/site/'],
};

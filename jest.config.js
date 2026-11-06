module.exports = {
	testEnvironment: 'node',
	// site/ is the separate Astro project with its own node:test and Playwright suites
	// .claude/ holds other sessions' worktrees, each a full copy of the repo
	testPathIgnorePatterns: ['/node_modules/', '<rootDir>/site/', '<rootDir>/.claude/'],
	modulePathIgnorePatterns: ['<rootDir>/site/', '<rootDir>/.claude/'],
};

module.exports = {
	testEnvironment: 'jsdom',
	testEnvironmentOptions: {
		url: 'http://localhost'
	},
	automock: false,
	setupFilesAfterEnv: ['./jestsetup.js'],
	collectCoverageFrom: ['src/**/*.js'],
	// Skip server tests and NewFilm on gh-pages branch (static site has no server or upload)
	testPathIgnorePatterns: [
		'<rootDir>/node_modules/',
		'<rootDir>/src/server/',
		'<rootDir>/src/app/films/NewFilm/',
		'<rootDir>/src/app/shared/FileValidator/',
		'<rootDir>/src/app/helper/api.spec.js',
	],
	coveragePathIgnorePatterns: [
		'<rootDir>/preview',
		'<rootDir>/src/app/entry',
		'<rootDir>/src/server/',
	],
	coverageReporters: ['html', 'text-summary', 'text', 'json', 'lcov'],
	coverageDirectory: 'coverage',
	moduleDirectories: ['node_modules', 'src'],
	coverageThreshold: {
		global: {
			branches: 0,
			functions: 0,
			lines: 0,
			statements: 0,
		},
	},
	// Fix MongoDB TypeScript compatibility issues
	transformIgnorePatterns: [
		'node_modules/(?!(mongodb|mongoose)/)'
	],
	// Mock MongoDB, Mongoose, and API for tests
	moduleNameMapper: {
		'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
			'<rootDir>/__mocks__/fileMock.js',
		'\\.(css|scss)$': 'identity-obj-proxy',
		'^mongoose$': '<rootDir>/__mocks__/mongoose.js',
		'^mongodb$': '<rootDir>/__mocks__/mongodb.js',
		'^mockingoose$': '<rootDir>/__mocks__/mockingoose.js',
		// Map api-static for static site tests
		'.*helper/api-static$': '<rootDir>/__mocks__/api-static.js',
	},
};

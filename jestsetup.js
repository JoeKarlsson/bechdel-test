import '@testing-library/jest-dom';
require('jest-fetch-mock').enableMocks();

// Polyfill for TextEncoder/TextDecoder in Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock IntersectionObserver for jsdom
global.IntersectionObserver = class IntersectionObserver {
	constructor(callback) {
		this.callback = callback;
	}
	observe() { return null; }
	unobserve() { return null; }
	disconnect() { return null; }
};

// Mock ResizeObserver for jsdom
global.ResizeObserver = class ResizeObserver {
	constructor(callback) {
		this.callback = callback;
	}
	observe() { return null; }
	unobserve() { return null; }
	disconnect() { return null; }
};

// Suppress Mongoose Jest warnings
process.env.SUPPRESS_JEST_WARNINGS = 'true';

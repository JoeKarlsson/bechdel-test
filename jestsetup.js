import '@testing-library/jest-dom';
require('jest-fetch-mock').enableMocks();

// Polyfill for TextEncoder/TextDecoder in Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock ResizeObserver for recharts
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Mock IntersectionObserver for components using it
global.IntersectionObserver = class IntersectionObserver {
	constructor(callback) {
		this.callback = callback;
	}
	observe() {
		// Immediately call with intersecting = true
		this.callback([{ isIntersecting: true }]);
	}
	unobserve() {}
	disconnect() {}
};

// Mock getBoundingClientRect for recharts ResponsiveContainer
Element.prototype.getBoundingClientRect = jest.fn(() => ({
	width: 500,
	height: 300,
	top: 0,
	left: 0,
	bottom: 300,
	right: 500,
	x: 0,
	y: 0,
	toJSON: () => {},
}));

// Suppress Mongoose Jest warnings
process.env.SUPPRESS_JEST_WARNINGS = 'true';

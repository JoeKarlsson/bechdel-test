import '@testing-library/jest-dom';
require('jest-fetch-mock').enableMocks();

// Polyfill for TextEncoder/TextDecoder in Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Suppress Mongoose Jest warnings
process.env.SUPPRESS_JEST_WARNINGS = 'true';

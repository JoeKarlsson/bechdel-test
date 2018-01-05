const mockGetSimpleCastData = require('./mock-simple-data.json');
const mockGetFullCastData = require('./mock-full-data.json');
const merge = require('../merge');

const { mergeObj } = merge;

module.exports = mergeObj(mockGetSimpleCastData, mockGetFullCastData);

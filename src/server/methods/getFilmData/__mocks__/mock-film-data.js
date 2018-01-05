const mockGetSimpleCastData = require('./mock-simple-data.json');
const mockGetFullCastData = require('./mock-full-data.json');
const mockActorData = require('./mock-actor-data.json');
const mockImageData = require('./mock-image-data.json');

module.exports = {
	actors: mockActorData,
	images: mockImageData,
	metadata: [mockGetSimpleCastData, mockGetFullCastData],
};

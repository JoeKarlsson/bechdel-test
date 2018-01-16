const mockSimpleData = require('./mock-simple-data');
const mockCastData = require('./mock-cast-data.json');
const mockImageData = require('./mock-image-data.json');
const mockBechdelData = require('./mock-bechdel-data.json');

module.exports = {
	actors: mockCastData,
	images: mockImageData,
	metadata: mockSimpleData,
	bechdelData: mockBechdelData,
};

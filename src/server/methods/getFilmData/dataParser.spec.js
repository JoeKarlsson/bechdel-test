import dataParser from './dataParser';
import mockCastData from './__mocks__/mock-cast-data.json';
import mockFullCastData from './__mocks__/mock-full-cast-data.json';

describe('Data Parser', () => {
	it('should parse cast data', () => {
		const result = dataParser(mockFullCastData.cast);
		expect(result).toMatchObject(mockCastData);
	});
});

const dataParser = require('./dataParser');

describe('Data Parser', () => {
	it('should parser simple cast data', () => {
		const simpleCastdata = [
			{
				actorName: 'Christian Bale',
				character: 'Steve',
				actorActress: 'Actor',
				_id: '5a2f044e491eef5edab46b97',
				biography: {
					actorActress: 'actor',
				},
			},
			{
				actorName: 'Bradley Cooper',
				character: 'Mike',
				actorActress: 'Actor',
				_id: '5a2f044e491eef5edab46b96',
				biography: {
					actorActress: 'actor',
				},
			},
			{
				actorName: 'Amy Adams',
				character: 'Nicole',
				actorActress: 'Actress',
				_id: '5a2f044e491eef5edab46b95',
				biography: {
					actorActress: 'actress',
				},
			},
		];

		const expectedResult = [
			{
				actorName: 'Christian Bale',
				gender: 'actor',
				characterName: 'STEVE',
				mainCast: false,
			},
			{
				actorName: 'Bradley Cooper',
				gender: 'actor',
				characterName: 'MIKE',
				mainCast: false,
			},
			{
				actorName: 'Amy Adams',
				gender: 'actress',
				characterName: 'NICOLE',
				mainCast: false,
			},
		];

		const result = dataParser(simpleCastdata, 'mainCast');
		expect(result).toMatchObject(expectedResult);
	});
});

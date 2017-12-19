const dataParser = require('./dataParser');

describe('Data Parser', () => {
	it('should parser simple cast data', () => {

		const simpleCastdata = {
			data: {
				movies: [{
					actors: [
						{
							actorName: 'Christian Bale',
							character: 'Steve',
							actorActress: 'Actor',
							_id: '5a2f044e491eef5edab46b97',
							biography: {
								actorActress: 'actor',
							},
						}, {
							actorName: 'Bradley Cooper',
							character: 'Mike',
							actorActress: 'Actor',
							_id: '5a2f044e491eef5edab46b96',
							biography: {
								actorActress: 'actor',
							},
						}, {
							actorName: 'Amy Adams',
							character: 'Nicole',
							actorActress: 'Actress',
							_id: '5a2f044e491eef5edab46b95',
							biography: {
								actorActress: 'actress',
							},
						},
					],
					title: 'Boyhood',
					originalTitle: '',
					year: '2014',
					releaseDate: '20140815',
					directors: [{
						name: 'Richard Linklater',
						id: 'nm0000500',
					}],
					writers: [{
						name: 'Richard Linklater',
						id: 'nm0000500',
					}],
					runtime: '165 min',
					urlPoster: 'https://images-na.ssl-images-amazon.com/images/M/MV5BMTYzNDc2MDc0N15BMl5BanBnXkFtZTgwOTcwMDQ5MTE@._V1_UX182_CR0,0,182,268_AL_.jpg',
					countries: ['USA'],
					languages: ['English', 'Spanish'],
					genres: ['Drama'],
					plot: 'Filmed over 12 years with the same cast,s BOYHOOD is a groundbreaking story of growing up as seen through the eyes of a child named Mason (a breakthrough performance by ), who literally grows up on screen before our eyes. Starring and as Masons parents and newcomer Lorelei Linklater as his sister Samantha, BOYHOOD charts the rocky terrain of childhood like no other film has before. Snapshots of adolescence from road trips and family dinners to birthdays and graduations and all the moments in between become transcendent, set to a soundtrack spanning the years from Coldplays Yellow to Arcade Fires Deep Blue. BOYHOOD is both a nostalgic time capsule of the recent past and an ode to growing up and parenting.',
					simplePlot: 'The life of Mason, from early childhood to his arrival at college.',
					idIMDB: 'tt1065073',
					urlIMDB: 'http://www.imdb.com/title/tt1065073',
					rating: '7.9',
					metascore: '100',
					rated: 'R',
					votes: '295,534',
					type: 'Movie',
				}],
			},
		};

		const expectedResult = [
			{
				actorName: 'Christian Bale',
				gender: 'actor',
				characterName: 'STEVE',
				mainCast: false,
			}, {
				actorName: 'Bradley Cooper',
				gender: 'actor',
				characterName: 'MIKE',
				mainCast: false,
			}, {
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

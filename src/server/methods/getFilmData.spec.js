const nock = require('nock');
const getFilmData = require('./getFilmData.js');

describe('Film methods', () => {
	const filmTitle = 'BOYHOOD';

	afterEach(() => {
		getFilmData.clearData();
	});

	describe('#getSimpleCastData', () => {
		it('should call callback after success', () => {
			const path = '?title=BOYHOOD&token=d44147a7-5e6e-4450-92ba-773be44791ce&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=1&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0';

			const mockResponse = {
				data: {
					movies: [{
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
				about: {
					version: '2.34.0',
					serverTime: '2017/12/12 22:11:48',
				},
			};

			nock('http://api.myapifilms.com/imdb/idIMDB')
				.get(path)
				.reply(200, mockResponse);


			getFilmData.getSimpleCastData(filmTitle)
				.then((body) => {
					expect(body).toMatchObject(mockResponse);
				})
				.catch((err) => {
					console.log('err', err);
				});
		});
	});

	describe('#getFullCastData', () => {
		it('should call callback after success', (() => {

			const path = '?title=BOYHOOD&token=d44147a7-5e6e-4450-92ba-773be44791ce&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=2&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0';

			const mockResponse = {
				data: {
					movies: [{
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
				about: {
					version: '2.34.0',
					serverTime: '2017/12/12 22:11:48',
				},
			};

			nock('http://api.myapifilms.com/imdb/idIMDB')
				.get(path)
				.reply(200, mockResponse);

			getFilmData.getFullCastData(filmTitle)
				.then((body) => {
					expect(body).toMatchObject(mockResponse);
				});
		}));
	});

	describe('#getData', () => {
		it('should return all the film data as a promise', (() => {
			const pathComplex = '?title=BOYHOOD&token=d44147a7-5e6e-4450-92ba-773be44791ce&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=2&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0';

			const pathSimple = '?title=BOYHOOD&token=d44147a7-5e6e-4450-92ba-773be44791ce&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=1&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0';

			const mockResponseSimple = {
				data: {
					movies: [{
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
				about: {
					version: '2.34.0',
					serverTime: '2017/12/12 22:11:48',
				},
			};

			const mockResponseComplex = {
				data: {
					movies: [{
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
				about: {
					version: '2.34.0',
					serverTime: '2017/12/12 22:11:48',
				},
			};

			nock('http://api.myapifilms.com/imdb/idIMDB')
				.get(pathSimple)
				.reply(200, mockResponseSimple)
				.get(pathComplex)
				.reply(200, mockResponseComplex);

			getFilmData.getFullCastData(filmTitle)
				.then((body) => {
					expect(body).toMatchObject({});
				});
		}));
	});

	describe('#getAllData', () => {
		it('should return the empty filmData obj', (() => {
			const result = getFilmData.getAllData();

			const filmData = {
				actors: [],
				images: {},
				data: [],
			};
			expect(result).toMatchObject(filmData);
		}));
	});

	describe('#clearData', () => {
		it('should clear the filmData obj', (() => {
			const result = getFilmData.clearData();

			const filmData = {
				actors: [],
				images: {},
				data: [],
			};
			expect(result).toMatchObject(filmData);
		}));
	});
});

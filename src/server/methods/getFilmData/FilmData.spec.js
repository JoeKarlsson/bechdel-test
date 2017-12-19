const filmData = require('./FilmData');

describe('FilmData', () => {

	beforeEach(() => {
		filmData.clear();
	});

	describe('inital state', () => {
		it('should be empty', () => {
			expect(filmData.actors).toMatchObject([]);
			expect(filmData.images).toMatchObject({});
			expect(filmData.metaData).toMatchObject([]);
		});
	});

	describe('Actors', () => {
		it('should add a new actor to the actor array', () => {
			expect(filmData.actors).toMatchObject([]);
			const actor = {
				actorName: 'Christian Bale',
				actorActress: 'Actor',
				_id: '5a2f044e491eef5edab46b97',
			};

			const expectedResult = [actor];

			filmData.addActor(actor);
			expect(filmData.actors).toMatchObject(expectedResult);
		});
	});

	describe('Images', () => {
		it('should add a new image to the images object', () => {
			expect(filmData.images).toMatchObject({});
			const image = {
				backdrops: ['https://image.tmdb.org/t/p/w1000/aE1gbq6nw8zyVqvEBXMVMCqZpCs.jpg'],
				posters: ['https://image.tmdb.org/t/p/w300/eKi4e5zXhQKs0De4xu5AAMvu376.jpg'],
			};

			const expectedResult = image;

			filmData.images = image;
			expect(filmData.images).toMatchObject(expectedResult);
		});
	});

	describe('Metadata', () => {
		it('should add a new image to the images object', () => {
			expect(filmData.metaData).toMatchObject([]);
			const metaData = {
				directors: [
					{
						name: 'David O. Russell',
						id: 'nm0751102',
						_id: '5a2f044e491eef5edab46b86',
					},
				],
				genres: [
					'Crime',
					'Drama',
				],
				idIMDB: 'tt1800241',
				metascore: 90,
				plot: 'A fictional film set in the alluring world of one of the most stunning scandals to rock our nation, American Hustle tells the story of brilliant con man Irving Rosenfeld (), who along with his equally cunning and seductive British partner Sydney Prosser () is forced to work for a wild FBI agent Richie DiMaso (). DiMaso pushes them into a world of Jersey powerbrokers and mafia thats as dangerous as it is enchanting. is Carmine Polito, the passionate, volatile, New Jersey political operator caught between the con-artists and Feds. Irvings unpredictable wife Rosalyn () could be the one to pull the thread that brings the entire world crashing down.',
				rated: 'R',
				rating: '7.3',
				releaseDate: '20131220',
				simplePlot: 'A con man, Irving Rosenfeld, along with his seductive partner Sydney Prosser, is forced to work for a wild F.B.I. Agent, Richie DiMaso, who pushes them into a world of Jersey powerbrokers and Mafia.',
				title: 'American Hustle',
				urlIMDB: 'http://www.imdb.com/title/tt1800241',
				urlPoster: 'https://images-na.ssl-images-amazon.com/images/M/MV5BMmM4YzJjZGMtNjQxMy00NjdlLWJjYTItZWZkYzdhOTdhNzFiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_UX182_CR0,0,182,268_AL_.jpg',
				writers: [
					{
						name: 'Eric Warren Singer',
						id: 'nm2545235',
						_id: '5a2f044e491eef5edab46b88',
					}, {
						name: 'David O. Russell',
						id: 'nm0751102',
						_id: '5a2f044e491eef5edab46b87',
					},
				],
				year: 2013,
			};

			const expectedResult = [metaData];

			filmData.addMetaData(metaData);
			expect(filmData.metaData).toMatchObject(expectedResult);
		});
	});

	describe('getAllData', () => {
		it('should return all the data as an object', () => {
			expect(filmData.actors).toMatchObject([]);
			const actor = {
				actorName: 'Christian Bale',
				actorActress: 'Actor',
				_id: '5a2f044e491eef5edab46b97',
			};
			filmData.addActor(actor);

			const image = {
				backdrops: ['https://image.tmdb.org/t/p/w1000/aE1gbq6nw8zyVqvEBXMVMCqZpCs.jpg'],
				posters: ['https://image.tmdb.org/t/p/w300/eKi4e5zXhQKs0De4xu5AAMvu376.jpg'],
			};
			filmData.images = image;

			const metadata = {
				directors: [
					{
						name: 'David O. Russell',
						id: 'nm0751102',
						_id: '5a2f044e491eef5edab46b86',
					},
				],
				genres: [
					'Crime',
					'Drama',
				],
			};
			filmData.addMetaData(metadata);

			const expectedResult = {
				actors: [actor],
				images: image,
				metadata: [metadata],
			};

			expect(filmData.getAllData()).toMatchObject(expectedResult);
		});
	});

	describe('clear', () => {
		it('should clear all the data in the object', () => {
			expect(filmData.actors).toMatchObject([]);
			const actor = {
				actorName: 'Christian Bale',
				actorActress: 'Actor',
				_id: '5a2f044e491eef5edab46b97',
			};
			filmData.addActor(actor);

			const image = {
				backdrops: ['https://image.tmdb.org/t/p/w1000/aE1gbq6nw8zyVqvEBXMVMCqZpCs.jpg'],
				posters: ['https://image.tmdb.org/t/p/w300/eKi4e5zXhQKs0De4xu5AAMvu376.jpg'],
			};
			filmData.images = image;

			const metadata = {
				directors: [
					{
						name: 'David O. Russell',
						id: 'nm0751102',
						_id: '5a2f044e491eef5edab46b86',
					},
				],
				genres: [
					'Crime',
					'Drama',
				],
			};
			filmData.addMetaData(metadata);

			const expectedResult = {
				actors: [actor],
				images: image,
				metadata: [metadata],
			};

			expect(filmData.getAllData()).toMatchObject(expectedResult);

			const expectedClearResult = {
				actors: [],
				images: {},
				metadata: [],
			};

			filmData.clear();

			expect(filmData.getAllData()).toMatchObject(expectedClearResult);
		});
	});
});

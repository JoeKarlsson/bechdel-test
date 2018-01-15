const filmData = require('./FilmData');

describe('FilmData', () => {
	beforeEach(() => {
		filmData.clear();
	});

	describe('inital state', () => {
		it('should be empty', () => {
			expect(filmData.actors).toMatchObject([]);
			expect(filmData.images).toMatchObject({});
			expect(filmData.metaData).toMatchObject({});
		});
	});

	describe('Actors', () => {
		it('should add a new actor to the actor array', () => {
			expect(filmData.actors).toMatchObject([]);

			const actor = [
				{
					actorName: 'Christian Bale',
					character: 'Steve',
					actorActress: 'Actor',
				},
				{
					actorName: 'Ellar Coltrane',
					character: 'MASON',
					mainCast: false,
				},
			];

			const expectedResult = actor;

			filmData.addActors(actor);
			expect(filmData.actors).toMatchObject(expectedResult);
			expect(filmData.actors.length).toBe(2);
		});

		it('should merge two sets of actors with no duplicates', () => {
			expect(filmData.actors).toMatchObject([]);
			const actors1 = [
				{
					actorName: 'Ellar Coltrane',
					character: 'MASON',
				},
				{
					actorName: 'Patricia Arquette',
					character: 'MOM',
				},
			];

			const actors2 = [
				{
					actorName: 'Ellar Coltrane',
					character: 'MASON',
				},
				{
					actorName: 'Patricia Arquette',
					character: 'MOM',
				},
				{
					actorName: 'Elijah Smith',
					character: 'TOMMY',
				},
				{
					actorName: 'Lorelei Linklater',
					character: 'SAMANTHA',
				},
			];

			filmData.addActors(actors1);
			expect(filmData.actors).toMatchObject(actors1);
			expect(filmData.actors.length).toBe(2);

			filmData.addActors(actors2);
			expect(filmData.actors).toMatchObject(actors2);
			expect(filmData.actors.length).toBe(4);
		});
	});

	describe('Images', () => {
		it('should add a new image to the images object', () => {
			expect(filmData.images).toMatchObject({});
			const image = {
				backdrops: [
					'https://image.tmdb.org/t/p/w1000/aE1gbq6nw8zyVqvEBXMVMCqZpCs.jpg',
				],
				posters: [
					'https://image.tmdb.org/t/p/w300/eKi4e5zXhQKs0De4xu5AAMvu376.jpg',
				],
			};

			const expectedResult = image;

			filmData.images = image;
			expect(filmData.images).toMatchObject(expectedResult);
		});
	});

	describe('Metadata', () => {
		it('should add metadata to the metadata property', () => {
			expect(filmData.metaData).toMatchObject({});
			const metaData = {
				directors: [
					{
						name: 'David O. Russell',
						id: 'nm0751102',
						_id: '5a2f044e491eef5edab46b86',
					},
				],
				genres: ['Crime', 'Drama'],
				idIMDB: 'tt1800241',
				metascore: 90,
				rated: 'R',
				rating: '7.3',
				releaseDate: '20131220',
				title: 'American Hustle',
				urlIMDB: 'http://www.imdb.com/title/tt1800241',
				urlPoster:
					'https://images-na.ssl-images-amazon.com/images/M/MV5BMmM4YzJjZGMtNjQxMy00NjdlLWJjYTItZWZkYzdhOTdhNzFiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_UX182_CR0,0,182,268_AL_.jpg',
				writers: [
					{
						name: 'Eric Warren Singer',
						id: 'nm2545235',
						_id: '5a2f044e491eef5edab46b88',
					},
					{
						name: 'David O. Russell',
						id: 'nm0751102',
						_id: '5a2f044e491eef5edab46b87',
					},
				],
				year: 2013,
			};

			const expectedResult = metaData;

			filmData.addMetaData(metaData);
			expect(filmData.metaData).toMatchObject(expectedResult);
		});

		it('should combine multiple objects together', () => {
			expect(filmData.metaData).toMatchObject({});

			const metaData1 = {
				genres: ['Crime', 'Drama'],
				idIMDB: 'tt1800241',
				metascore: 90,
				rated: 'R',
				rating: '7.3',
				releaseDate: '20131220',
				year: 2013,
			};

			const metaData2 = {
				simplePlot:
					'A con man, Irving Rosenfeld, along with his seductive partner Sydney Prosser, is forced to work for a wild F.B.I. Agent, Richie DiMaso, who pushes them into a world of Jersey powerbrokers and Mafia.',
				title: 'American Hustle',
				urlIMDB: 'http://www.imdb.com/title/tt1800241',
				urlPoster:
					'https://images-na.ssl-images-amazon.com/images/M/MV5BMmM4YzJjZGMtNjQxMy00NjdlLWJjYTItZWZkYzdhOTdhNzFiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_UX182_CR0,0,182,268_AL_.jpg',
			};

			const expectedResult1 = metaData1;
			const expectedResult2 = Object.assign({}, metaData1, metaData2);

			filmData.addMetaData(metaData1);
			expect(filmData.metaData).toMatchObject(expectedResult1);

			filmData.addMetaData(metaData2);
			expect(filmData.metaData).toMatchObject(expectedResult2);
		});
	});

	describe('getAllData', () => {
		it('should return all the data as an object', () => {
			expect(filmData.actors).toMatchObject([]);
			const actors = [
				{
					actorName: 'Christian Bale',
					character: 'TOMMY',
				},
				{
					actorName: 'Christian Bale',
					character: 'TOMMY',
				},
			];
			filmData.addActors(actors);

			const image = {
				backdrops: [
					'https://image.tmdb.org/t/p/w1000/aE1gbq6nw8zyVqvEBXMVMCqZpCs.jpg',
				],
				posters: [
					'https://image.tmdb.org/t/p/w300/eKi4e5zXhQKs0De4xu5AAMvu376.jpg',
				],
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
				genres: ['Crime', 'Drama'],
			};
			filmData.addMetaData(metadata);

			const expectedResult = {
				actors,
				images: image,
				metadata,
			};

			expect(filmData.getAllData()).toMatchObject(expectedResult);
		});
	});

	describe('clear', () => {
		it('should clear all the data in the object', () => {
			expect(filmData.actors).toMatchObject([]);
			const actors = [
				{
					actorName: 'Christian Bale',
					actorActress: 'Actor',
					character: 'TOMMY',
				},
				{
					actorName: 'Christian Bale',
					actorActress: 'Actor',
					character: 'Mike',
				},
			];
			filmData.addActors(actors);

			const image = {
				backdrops: [
					'https://image.tmdb.org/t/p/w1000/aE1gbq6nw8zyVqvEBXMVMCqZpCs.jpg',
				],
				posters: [
					'https://image.tmdb.org/t/p/w300/eKi4e5zXhQKs0De4xu5AAMvu376.jpg',
				],
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
				genres: ['Crime', 'Drama'],
			};
			filmData.addMetaData(metadata);

			const expectedResult = {
				actors,
				images: image,
				metadata,
			};

			expect(filmData.getAllData()).toMatchObject(expectedResult);

			const expectedClearResult = {
				actors: [],
				images: {},
				metadata: {},
			};

			filmData.clear();

			expect(filmData.getAllData()).toMatchObject(expectedClearResult);
		});
	});
});

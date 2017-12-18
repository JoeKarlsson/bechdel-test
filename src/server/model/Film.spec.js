import mockingoose from 'mockingoose';
import Film from './Film';

const _doc = {
	actors: [
		{
			actorName: 'Christian Bale',
			actorActress: 'Actor',
			_id: '5a2f044e491eef5edab46b97',
		}, {
			actorName: 'Bradley Cooper',
			actorActress: 'Actor',
			_id: '5a2f044e491eef5edab46b96',
		}, {
			actorName: 'Amy Adams',
			actorActress: 'Actress',
			_id: '5a2f044e491eef5edab46b95',
		}, {
			actorName: 'Jeremy Renner',
			actorActress:
			'Actor',
			_id: '5a2f044e491eef5edab46b94',
		}, {
			actorName: 'Jennifer Lawrence',
			actorActress: 'Actress',
			_id: '5a2f044e491eef5edab46b93',
		}, {
			actorName: 'Louis C.K.',
			actorActress: 'Actor',
			_id: '5a2f044e491eef5edab46b92',
		}, {
			actorName: 'Jack Huston',
			actorActress: 'Actor',
			_id: '5a2f044e491eef5edab46b91',
		}, {
			actorName: 'Michael Peña',
			actorActress: 'Actor',
			_id: '5a2f044e491eef5edab46b90',
		}, {
			actorName: 'Shea Whigham',
			actorActress: 'Actor',
			_id: '5a2f044e491eef5edab46b8f',
		},
	],
	bechdelResults: {
		bechdelScore: 1,
		numOfFemalesChars: 3,
		numOfFemalesCharsWithDialogue: 0,
		numOfMaleChars: 12,
		numOfMaleCharsWithDialogue: 0,
		numScenesDontPass: 161,
		numScenesPass: 0,
		pass: false,
		totalLinesFemaleDialogue: 0,
		totalLinesMaleDialogue: 0,
	},
	createdAt: '2017-12-11T22:18:54.588Z',
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
	images: {
		backdrop: 'https://image.tmdb.org/t/p/w1000/aE1gbq6nw8zyVqvEBXMVMCqZpCs.jpg',
		poster: 'https://image.tmdb.org/t/p/w300/eKi4e5zXhQKs0De4xu5AAMvu376.jpg',
	},
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
	__v: 0,
	_id: '5a2f044e491eef5edab46b85',
};

const filmData = [{
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
}];

const bechdelResults = {
	bechdelScore: 1,
	numOfFemalesChars: 3,
	numOfFemalesCharsWithDialogue: 0,
	numOfMaleChars: 12,
	numOfMaleCharsWithDialogue: 0,
	numScenesDontPass: 161,
	numScenesPass: 0,
	pass: false,
	totalLinesFemaleDialogue: 0,
	totalLinesMaleDialogue: 0,
};

const actors = [
	{
		actorName: 'Christian Bale',
		actorActress: 'Actor',
		_id: '5a2f044e491eef5edab46b97',
	}, {
		actorName: 'Bradley Cooper',
		actorActress: 'Actor',
		_id: '5a2f044e491eef5edab46b96',
	}, {
		actorName: 'Amy Adams',
		actorActress: 'Actress',
		_id: '5a2f044e491eef5edab46b95',
	}, {
		actorName: 'Jeremy Renner',
		actorActress:
		'Actor',
		_id: '5a2f044e491eef5edab46b94',
	}, {
		actorName: 'Jennifer Lawrence',
		actorActress: 'Actress',
		_id: '5a2f044e491eef5edab46b93',
	}, {
		actorName: 'Louis C.K.',
		actorActress: 'Actor',
		_id: '5a2f044e491eef5edab46b92',
	}, {
		actorName: 'Jack Huston',
		actorActress: 'Actor',
		_id: '5a2f044e491eef5edab46b91',
	}, {
		actorName: 'Michael Peña',
		actorActress: 'Actor',
		_id: '5a2f044e491eef5edab46b90',
	}, {
		actorName: 'Shea Whigham',
		actorActress: 'Actor',
		_id: '5a2f044e491eef5edab46b8f',
	},
];

const images = {
	backdrops: ['https://image.tmdb.org/t/p/w1000/aE1gbq6nw8zyVqvEBXMVMCqZpCs.jpg'],
	posters: ['https://image.tmdb.org/t/p/w300/eKi4e5zXhQKs0De4xu5AAMvu376.jpg'],
};

const _errDoc = {
	err: 'THIS IS AN ERROR',
};

const _errDocResult = {
	_id: expect.any(String),
	actors: [],
	createdAt: expect.any(String),
	directors: [],
	genres: [],
	writers: [],
};

describe('Mongoose Film model', () => {
	beforeEach(() => {
		mockingoose.resetAll();
	});

	describe('#findById', () => {
		it('should return the doc with findById', () => {
			mockingoose.Film.toReturn(_doc, 'find');

			return Film
				.findByID('5a2f044e491eef5edab46b85')
				.then((doc) => {
					expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
				});
		});
		it('should return error if not found', () => {
			mockingoose.Film.toReturn(_errDoc, 'find');
			return Film
				.findByID('5a2f044e491eef5edab46b85')
				.then((doc) => {
					expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_errDocResult);
				});
		});
	});

	describe('#findByTitle', () => {
		it('should return the doc with findByTitle', () => {
			mockingoose.Film.toReturn(_doc, 'find');

			return Film
				.findByTitle('American Hustle')
				.then((doc) => {
					expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
				});
		});
		it('should return error if not found', () => {
			mockingoose.Film.toReturn(_errDoc, 'find');
			return Film
				.findByTitle('American Hustle')
				.then((doc) => {
					expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_errDocResult);
				});
		});
	});

	describe('#listAll', () => {
		it('should return the doc with listAll', () => {
			mockingoose.Film.toReturn(_doc, 'find');

			return Film
				.listAll()
				.then((doc) => {
					expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
				});
		});
		it('should return error if not found', () => {
			mockingoose.Film.toReturn(_errDoc, 'find');
			return Film
				.listAll()
				.then((doc) => {
					expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_errDocResult);
				});
		});
	});

	describe('#saveFilm', () => {
		it('should return the doc with saveFilm', () => {
			mockingoose.Film.toReturn(_doc, 'save');

			const newFilm = new Film({ title: 'filmTitle' });

			return Film
				.saveFilm(newFilm)
				.then((doc) => {
					expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
				});
		});
	});

	describe('#deleteFilm', () => {
		it('should return the doc with deleteFilm', () => {
			mockingoose.Film
				.toReturn(_doc, 'findOne')
				.toReturn(true, 'remove');

			return Film
				.deleteFilm('5a2f044e491eef5edab46b85')
				.then((success) => {
					expect(success).toBe(true);
				});
		});
	});

	describe('#insert', () => {
		it('should return the doc with insert', () => {
			mockingoose.Film.toReturn(_doc, 'save');

			return Film
				.insert('American Hustle', bechdelResults, actors, images, filmData)
				.then((doc) => {
					expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
				});
		});
	});

});

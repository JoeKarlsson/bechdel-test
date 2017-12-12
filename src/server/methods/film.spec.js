const nock = require('nock');
const film = require('./film.js');

describe('Film methods', () => {
	describe('#getSimpleCastData', () => {
		afterEach(() => {
			film.clearData();
		});

		const filmTitle = 'BOYHOOD';

		it('should call callback after success', () => {
			const response = nock('http://api.myapifilms.com/imdb/idIMDB')
				.get('/*')
				.reply(200, {
					_id: '123ABC',
					_rev: '946B7D1C',
					username: 'pgte',
					email: 'pedro.teixeira@gmail.com',
				});

			film.getSimpleCastData(filmTitle)
				.then((body) => {
					expect(body).toBe(JSON.parse(response));
				});
		});

  //   it('should send correct parameters to the expected URL', sinon.test(function () {
  //     const req = this.stub(request, 'get');
  //     const expectedUrl = 'http://api.myapifilms.com/imdb/idIMDB?title=BOYHOOD&token=d44147a7-5e6e-4450-92ba-773be44791ce&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=1&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0';
  //     film.getSimpleCastData(filmTitle);
  //     sinon.assert.calledWith(req, expectedUrl);
  //   }));
  // });
	//
  // describe('#getFullCastData', () => {
  //   afterEach(() => {
  //     film.clearData();
  //   });
  //   const filmTitle = 'BOYHOOD';
  //   it('should call callback after success', sinon.test(function () {
  //     const req = this.stub(request, 'get');
  //     const response = JSON.stringify({ data: { movies: [{ imdbID: 1234 }] } });
  //     req.yields(null, null, response, 'fullCast');
  //     film.getFullCastData(filmTitle)
  //     .then((body) => {
  //       expect(body).to.deep.equal(JSON.parse(response));
  //     });
  //   }));
  //   it('should send correct parameters to the expected URL', sinon.test(function () {
  //     const req = this.stub(request, 'get');
  //     const expectedUrl = 'http://api.myapifilms.com/imdb/idIMDB?title=BOYHOOD&token=d44147a7-5e6e-4450-92ba-773be44791ce&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=2&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0';
  //     const response = JSON.stringify({ data: { movies: [{ imdbID: 1234 }] } });
  //     req.yields(null, null, response, 'fullCast');
  //     film.getFullCastData(filmTitle);
  //     sinon.assert.calledWith(req, expectedUrl);
  //   }));
	});
});

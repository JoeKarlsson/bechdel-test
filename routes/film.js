'use strict'

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Film = require('../model/Film');
const scriptParser = require('../methods/scriptParser');
const omdb = require('../methods/omdb');
const bechdel = require('../methods/bechdel');

const multer  = require('multer');
const storage = multer.diskStorage({
  destination : function (req, file, cb) {
    cb(null, './tmp')
  },
  filename : function (req, file, cb) {
    cb(null, file.originalname)
  }
});
const upload = multer({ storage : storage });

/*
  * FILM ROUTES
*/
const cpUpload = upload.fields([
  {
    name : 'script', maxCount : 1
  }, {
    name : 'scriptName', maxCount : 1
  }
]);

const findFilmByID = (id) =>{
  if (id == null) {
    throw new Error('No film ID found');
  }
  var query = Film.findById(id);

  return query.exec(function(err, film) {
    if (err) {
      throw new Error(err);
    }
    return film;
  });
}

const findFilmByTitle = function(title) {
  if (title == null) {
    throw new Error('No film tile found');
  }
  var query = Film.find({ title :title });

  return query.exec(function(err, film) {
    if (err) {
      throw new Error(err);
    }
    return film;
  });
}

const listFilms = () => {
  var query = Film.find();

  return query.exec(function(err, films) {
    if (err) {
      throw new Error(err);
    }
    return films;
  });
}

const insertFilm = (film, callback) => {
  // var Account = new AccountModel();
  // Account.name = account.name;
  // Account.currency = account.currency;
  // Account.records = [];

  // Account.save(function(err) {
  //   if (err) {
  //     console.log(err);
  //     return null;
  //   }

  //   return callback(Account._id);
  // });
}

var deleteFilm = (filmID) => {
  var query = Film.findOne({ _id :filmID });

  return query.exec(function(err, film) {
    if (err) {
      throw new Error(err);
    }
    return film.remove();
  });
}

const clearTempScript = (path) => {
  fs.unlink(path, function(err) {
    if (err) {
      throw new Error(err);
    }
  });
}

router.route('/')
  .get(function(req, res) {
    listFilms()
    .then((films) => {
      res.send(films)

      // res.render('films', { films : films });
    })
  })
  .post(cpUpload, function (req, res) {
    let filmTitle;
    let movieChar;
    let scriptPath;

    if (Object.keys(req.files).length === 0 ) {
      //No script file sent
      res.send('No script submitted, please try again');
    } else {
      if (path.extname(req.files.script[0].originalname) !== '.txt') {
        //incorrect extention1
        res.send('Please send a .txt script');
      }
      scriptPath = req.files.script[0].path;
      scriptParser.readMovieTitle(scriptPath)
      .then((title) => {
        filmTitle = title;
        return findFilmByTitle(filmTitle);
      })
      .then((film) => {
        if ( film.length !== 0 ) {
          res.send(film);
          clearTempScript(scriptPath);
        }
      })
      .then(() => {
        return omdb.getOmdbData( filmTitle )
      })
      .then( (movieCharacters) => {
        movieChar = movieCharacters;
        return scriptParser.readScript(scriptPath)
      })
      .then( ( movieScript ) => {
        return bechdel.extractScenes( movieChar, movieScript )
      })
      .then( ( sceneArray ) => {
        return bechdel.sceneAnalysis( movieChar, sceneArray )
      })
      .then( ( bechdelResults ) => {
        let film = new Film({ title : filmTitle });
        film.bechdelResults = bechdelResults;
        return omdb.getAllOmdbBData(function(data) {
           if (data === undefined) {
             throw new Error('No data returned from OMDB')
           }
           film.plot = data[0].plot;
           film.simplePlot = data[0].simplePlot;
           film.year = data[0].year;
           film.directors = data[0].directors;
           film.writers = data[0].writers;
           film.rated = data[0].rated;
           film.genres = data[0].genres;
           film.urlPoster = data[0].urlPoster;
           film.idIMDB = data[0].idIMDB;
           film.urlIMDB = data[0].urlIMDB;

           var actorsArr = []
           for (var i = 0; i < data[0].actors.length; i++) {
             var actor = {};
             actor.actorName = data[0].actors[i].actorName;
             actor.character = data[0].actors[i].character;
             actor.actorActress = data[0].actors[i].biography.actorActress;
             actorsArr.push(actor)
           }
           film.actors = actorsArr;
           film.save(function(err, film) {
              if (err) {
                throw new Error(err)
              }
              res.send(film)
            })

           clearTempScript(scriptPath);
         })
      })
      .catch(function (error) {
        // Handle any error from all above steps
        throw new Error(error);
      })
    }
  })

router.route('/:id')
  .get(function (req, res) {
    //get single film
    const filmID = req.params.id;
    const film = findFilmByTitle(filmID)
    .then((film) => {
      res.send(film)
    });

  })
  .put(function (req, res) {
    //edit single film
  })
  .delete(function (req, res) {
    //delete single film
    const filmID = req.params.id;
    const film = deleteFilm(filmID)
    .then((film) => {
      res.send(film)
    });
  });

// export for server.js
module.exports = router;
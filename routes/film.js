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

const findFilmByID = (id) => {
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

const saveFilm = (film) => {
  return film.save(function(err, film) {
    if (err) {
      throw new Error(err);
    }
    return film;
  })
}

const insertFilm = (filmTitle, bechdelResults, omdbData) => {
  let film = new Film({ title : filmTitle });
  film.bechdelResults = bechdelResults;
  film.plot = omdbData[0].plot;
  film.simplePlot = omdbData[0].simplePlot;
  film.year = omdbData[0].year;
  film.directors = omdbData[0].directors;
  film.writers = omdbData[0].writers;
  film.rated = omdbData[0].rated;
  film.genres = omdbData[0].genres;
  film.urlPoster = omdbData[0].urlPoster;
  film.idIMDB = omdbData[0].idIMDB;
  film.urlIMDB = omdbData[0].urlIMDB;
  film.actors = parseActorArr(omdbData[0].actors);

  return saveFilm(film)
  .then((film) => {
    return film;
  })
  .catch(function (error) {
    // Handle any error from all above steps
    throw new Error(error);
  })
}

const parseActorArr = (arr) => {
  var actorsArr = []
  for (var i = 0; i < arr.length; i++) {
    var actor = {};
    actor.actorName = arr[i].actorName;
    actor.character = arr[i].character;
    actor.actorActress = arr[i].biography.actorActress;
    actorsArr.push(actor);
  }
  return actorsArr;
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
      res.send(films);
    })
  })
  .post(cpUpload, function (req, res) {
    let scriptPath;
    let filmTitle;

    if (Object.keys(req.files).length === 0 ) {
      //No script file sent
      res.send('No script submitted, please try again');
    } else {
      if (path.extname(req.files.script[0].originalname) !== '.txt') {
        //incorrect extention
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
          // Fill is already in our database - serve up info
          res.send(film);
          clearTempScript(scriptPath);
        } else {
          bechdel.getBechdelResults( filmTitle, scriptPath )
          .then( ( bechdelResults ) => {
            let filmData;
            omdb.getAllFilmData(function(data) {
              filmData = data;
              omdb.clearFilmData();
            });
            return insertFilm(filmTitle, bechdelResults, filmData);
          })
          .then((film) => {
            res.send(film);
            clearTempScript(scriptPath);
          })
          .catch(function (error) {
            // Handle any error from all above steps
            throw new Error(error);
          })
        }
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
    findFilmByID(filmID)
    .then((film) => {
      res.send(film);
      res.render('film', { film : film })
    });

  })
  .put(function (req, res) {
    //edit single film
  })
  .delete(function (req, res) {
    //delete single film
    const filmID = req.params.id;
    deleteFilm(filmID)
    .then((film) => {
      res.send(film);
    });
  });

// export for server.js
module.exports = router;
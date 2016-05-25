/* eslint strict: 0*/
'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const film = require('../methods/film');
const script = require('../methods/script');
const bechdel = require('../methods/bechdel');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../tmp');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
const cpUpload = upload.fields([
  {
    name: 'script',
    maxCount: 1,
  },
]);

/*
  * FILM ROUTES
*/
router.route('/')
  .get((req, res) => {
    film.listAll()
    .then((films) => {
      if (!films) {
        throw new Error('No list of films returned from film.listAll()');
      }
      res.send(films);
    });
  })
  .post(cpUpload, (req, res, next) => {
    let scriptPath;
    let filmTitle;

    if (!req.files.script) {
      res.send('No script submitted, please try again');
    } else {
      if (path.extname(req.files.script[0].originalname) !== '.txt') {
        res.send('Please send a .txt script');
      }
      scriptPath = req.files.script[0].path;
      script.readMovieTitle(scriptPath)
      .then((title) => {
        if (!title) {
          throw new Error('No movie returned from script.readMovieTitle(scriptPath)');
        }
        filmTitle = title;
        return film.findByTitle(filmTitle);
      })
      .then((movie) => {
        if (movie.length !== 0 || movie === null) {
          res.send(movie);
          script.clearTemp(scriptPath);
        } else {
          bechdel.getBechdelResults(filmTitle, scriptPath)
          .then((bechdelResults) => {
            if (!bechdelResults) {
              throw new Error(
                'No movie returned from ' +
                'bechdel.getBechdelResults(filmTitle, scriptPath)'
              );
            }
            console.log('3');
            const data = film.getAllData();
            return film.insert(
              filmTitle,
              bechdelResults,
              data.actors,
              data.images
            );
          })
          .then((savedFilm) => {
            if (!savedFilm) {
              throw new Error('Film not properly saved');
            }
            film.clearData();
            res.send(savedFilm);
            script.clearTemp(scriptPath);
          })
          .catch((err) => {
            throw new Error(err);
          });
        }
      })
      .catch(next)
      .error((err) => {
        throw new Error(err);
      });
    }
  });

router.route('/:id')
  .get((req, res) => {
    film.findByID(req.params.id)
    .then((movie) => {
      if (!movie) {
        throw new Error('No movie returned from film.findByID(req.params.id)');
      }
      res.send(movie);
    })
    .catch((err) => {
      throw new Error(err);
    });
  })
  .delete((req, res) => {
    film.deleteFilm(req.params.id)
    .then((movie) => {
      if (!movie) {
        throw new Error('No movie returned from film.deleteFilm(req.params.id)');
      }
      res.send(movie);
    })
    .catch((err) => {
      throw new Error(err);
    });
  });

module.exports = router;

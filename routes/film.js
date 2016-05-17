/* jshint esversion: 6 */
'use strict';

const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const film    = require('../methods/film');
const script  = require('../methods/script');
const bechdel = require('../methods/bechdel');
const multer  = require('multer');
const storage = multer.diskStorage({
  destination : (req, file, cb) => {
    cb(null, './tmp');
  },
  filename : (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload   = multer({ storage : storage });
const cpUpload = upload.fields([
  {
    name : 'script', maxCount : 1
  }
]);

/*
  * FILM ROUTES
*/
router.route('/')
  .get((req, res) => {
    console.log('hit')
    film.listAll()
    .then((films) => {
      res.send(films);
    });
  })
  .post(cpUpload, (req, res) => {
    let scriptPath;
    let filmTitle;
    let filmData;

    if (!req.files) {
      res.send('No script submitted, please try again');
    } else {
      if (path.extname(req.files.script[0].originalname) !== '.txt') {
        res.send('Please send a .txt script');
      }
      scriptPath = req.files.script[0].path;
      script.readMovieTitle(scriptPath)
      .then((title) => {
        filmTitle = title;
        return film.findByTitle(filmTitle);
      })
      .then((movie) => {
        if (movie.length !== 0 || movie === null) {
          res.send(movie);
          script.clearTemp(scriptPath);
        } else {
          bechdel.getBechdelResults( filmTitle, scriptPath )
          .then((bechdelResults) => {
            return film.insert(filmTitle, bechdelResults, film.getAllData());
          })
          .then((movie) => {
            film.clearData();
            res.send(movie);
            script.clearTemp(scriptPath);
          })
          .catch((err) => {
            throw new Error(err);
          });
        }
      })
      .catch((err) => {
        throw new Error(err);
      })
      .error((err) => {
        throw new Error(err);
      });
    }
  });

router.route('/:id')
  .get((req, res) => {
    film.findByID(req.params.id)
    .then((film) => {
      res.send(film);
    })
    .catch((err) => {
      throw new Error(err);
    })
  })
  .delete((req, res) => {
    film.deleteFilm(req.params.id)
    .then((film) => {
      res.send(film);
    })
    .catch((err) => {
      throw new Error(err);
    })
  });

module.exports = router;
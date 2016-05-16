'use strict';

const express = require('express');
const router  = express.Router();
const path    = require('path');
const Promise = require("bluebird");
import { listAll, findByTitle, findByID, insert, clearData, getAllData, deleteFilm } from '../methods/film';
import { readMovieTitle, clearTemp } from '../methods/script';
import { getBechdelResults } from '../methods/bechdel.js';
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
Promise.onPossiblyUnhandledRejection(function(error){
    throw error;
});

/*
  * FILM ROUTES
*/
router.route('/')
  .get((req, res) => {
    listAll()
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
      readMovieTitle(scriptPath)
      .then((title) => {
        filmTitle = title;
        return findByTitle(filmTitle);
      })
      .then((movie) => {
        if (movie.length !== 0 || movie === null) {
          res.send(movie);
          clearTemp(scriptPath);
        } else {
          getBechdelResults( filmTitle, scriptPath )
          .then((bechdelResults) => {
            return insert(filmTitle, bechdelResults, getAllData());
          })
          .then((movie) => {
            clearData();
            res.send(movie);
            clearTemp(scriptPath);
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
    findByID(req.params.id)
    .then((film) => {
      res.send(film);
    })
    .catch((err) => {
      throw new Error(err);
    })
  })
  .delete((req, res) => {
    deleteFilm(req.params.id)
    .then((film) => {
      res.send(film);
    })
    .catch((err) => {
      throw new Error(err);
    })
  });

module.exports = router;
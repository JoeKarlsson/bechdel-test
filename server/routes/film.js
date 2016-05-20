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
      res.send(films);
    });
  })
  .post(cpUpload, (req, res, next) => {
    let scriptPath;
    let filmTitle;

    if (!req.files) {
      res.send('No script submitted, please try again');
    } else {
      if (path.extname(req.files.script[0].originalname) !== '.txt') {
        res.send('Please send a .txt script');
      }
      scriptPath = req.files.script[0].path;
      script.readMovieTitle(scriptPath)
      .then((title) => {
        console.log(title);
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
            const data = film.getAllData();
            return film.insert(
              filmTitle,
              bechdelResults,
              data.data,
              data.images
            );
          })
          .then((savedFilm) => {
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

const errorHandler = (err, req, res) => {
  console.error(err);
};

router.route('/:id')
  .get((req, res) => {
    film.findByID(req.params.id)
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      throw new Error(err);
    });
  })
  .delete((req, res) => {
    film.deleteFilm(req.params.id)
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      throw new Error(err);
    });
  });

module.exports = router;

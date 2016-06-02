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
        res.status(500).send('No list of films returned from film.listAll()');
        throw new Error('No list of films returned from film.listAll()');
      }
      res.send(films);
    })
    .catch((err) => {
      res.status(500).send(err);
      throw new Error(err);
    });
  })
  .post(cpUpload, (req, res) => {
    let scriptPath;
    let filmTitle;

    if (!req.files.script) {
      res.status(500).send('No script submitted, please try again');
    } else {
      if (path.extname(req.files.script[0].originalname) !== '.txt') {
        res.status(500).send('Please send a .txt script');
      }
      scriptPath = req.files.script[0].path;
      script.readMovieTitle(scriptPath)
      .then((title) => {
        if (!title) {
          res.status(500).send('No movie returned from script.readMovieTitle(scriptPath)');
          throw new Error('No movie returned from script.readMovieTitle(scriptPath)');
        }
        filmTitle = title;
        return film.findByTitle(filmTitle);
      })
      .then((movie) => {
        if (movie) {
          script.clearTemp(scriptPath);
          return res.send(movie);
        }
        bechdel.getBechdelResults(filmTitle, scriptPath)
        .then((bechdelResults) => {
          if (!bechdelResults) {
            throw new Error(
              'No movie returned from ' +
              'bechdel.getBechdelResults(filmTitle, scriptPath)'
            );
          }
          const data = film.getAllData();
          return film.insert(
            filmTitle,
            bechdelResults,
            data.actors,
            data.images,
            data.data[0].data.movies
          );
        })
        .then((savedFilm) => {
          if (!savedFilm) {
            res.status(500).send('Film not properly saved.');
          }
          film.clearData();
          script.clearTemp(scriptPath);
          return res.send(savedFilm);
        })
        .catch((err) => {
          res.status(500).send(err);
          throw new Error(err);
        });
      })
      .catch((err) => {
        res.status(500).send(err);
        throw new Error(err);
      })
      .error((err) => {
        res.status(500).send(err);
        throw new Error(err);
      });
    }
  });

router.route('/:id')
  .get((req, res) => {
    film.findByID(req.params.id)
    .then((movie) => {
      if (!movie) {
        return res.send('No movie found by that ID');
      }
      res.send(movie);
    })
    .catch((err) => {
      res.status(500).send(err);
      throw new Error(err);
    });
  })
  .delete((req, res) => {
    film.deleteFilm(req.params.id)
    .then((movie) => {
      if (!movie) {
        return res.send('No movie found by that ID');
      }
      res.json({ success: true });
    })
    .catch((err) => {
      res.status(500).send(err);
      throw new Error(err);
    });
  });

module.exports = router;

'use strict';

const express = require('express');
const router  = express.Router();
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
    film.listAll()
    .then((films) => {
      res.send(films);
    });
  })
  .post(cpUpload, (req, res) => {
    let scriptPath,
        filmTitle,
        filmData;

    if (Object.keys(req.files).length === 0 ) {
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
      .then((_film) => {
        if ( _film.length !== 0 ) {
          res.send(_film);
          script.clearTemp(scriptPath);
        } else {
          bechdel.getBechdelResults( filmTitle, scriptPath )
          .then((bechdelResults) => {
            film.getAllData((data) => {
              filmData = data;
              film.clearData();
            });
            return film.insert(filmTitle, bechdelResults, filmData);
          })
          .then((_film) => {
            res.send(_film);
            script.clearTemp(scriptPath);
          })
          .catch((error) => {
            throw new Error(error);
          });
        }
      })
      .catch((error) => {
        throw new Error(error);
      });
    }
  });

router.route('/:id')
  .get((req, res) => {
    const id = req.params.id;
    film.findByID(id)
    .then((film) => {
      res.send(film);
    });
  })
  .delete((req, res) => {
    const id = req.params.id;
    film.delete(id)
    .then((film) => {
      res.send(film);
    });
  });

module.exports = router;
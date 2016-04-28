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

router.route('/')
  .post(cpUpload, function (req, res) {
    const movieTitle = req.body.film;
    if (Object.keys(req.files).length === 0 ) {
      //No script file sent
      res.send('No script submitted, please try again');
    } else {
      if (path.extname(req.files.script[0].originalname) !== '.txt') {
        //incorrect extention
        res.send('Please send a .txt script');
      }
      const scriptPath = req.files.script[0].path;

      Film.findOne({ 'title' : movieTitle }, function ( err, film ) {
        if ( err ) {
          throw new Error(err);
        }
        if ( film === null ) {
          //Film not in DB
          var film = new Film({ });
          var movieChar = [];

          scriptParser.readMovieTitle(scriptPath)
         .then( (movieTitle) => {
           console.log( 'Movie Script Title: ', movieTitle );
           film.title = movieTitle;
           return omdb.getOmdbData( movieTitle )
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
           film.bechdelResults = bechdelResults;
           omdb.getAllOmdbBData(function(data) {
              console.log(data[0])
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

              let omdbAcrtors = data[0].actors;
              var actorsArr = []
              for (var i = 0; i < omdbAcrtors.length; i++) {
                var actor = {};
                actor.actorName = omdbAcrtors[i].actorName;
                actor.character = omdbAcrtors[i].character;
                actorsArr.push(actor)
              }
              film.actors = actorsArr;

              film.save(function(err, film, numAffected) {
                 if (err) {
                   throw new Error(err)
                 }
                 console.log(film, numAffected, 'film, numAffected')
               })

              scriptParser.deleteTmpScript(scriptPath)
              res.send(film)
              .then(omdb.clearOmdbBData())
            })
         })
         .catch(function (error) {
           // Handle any error from all above steps
           reject(error);
         })

        }
      });
    }

  })
  .get(function (req, res) {
    //returns all of the films in the DB
  })

router.route('/:id')
  .get(function (req, res) {
    //get single film
  })
  .put(function (req, res) {
    //edit single film
  })
  .delete(function (req, res) {
    //delete single film
  });

// export for server.js
module.exports = router;
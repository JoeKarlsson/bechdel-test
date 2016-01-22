var express = require('express');
var router = express.Router();

/*
  * FILM ROUTES
*/
router
  .route('/')

  .get(function (req, res) {
    // get all films from our database

    // render our index template passing in the 2D array
    res.render('index', {
      listings : listings2d,
      user : req.user,
      masthead : masthead
    });
  })



/*
  * INDIVIDUAL FILMS
*/
router.get('/:id', function (req, res) {
  // grab film

});


// export for server.js
module.exports = router;
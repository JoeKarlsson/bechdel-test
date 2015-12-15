var express = require('express');
var router = express.Router();

/* GET films listing. */
router.get('/', function(req, res, next) {
  res.render('imitation-game', {
    title : 'Bechdel Test Visualizer'
  });

});

module.exports = router;
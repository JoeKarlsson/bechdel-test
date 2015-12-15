var express = require('express');
var router = express.Router();

/* GET films listing. */
router.get('/', function(req, res, next) {
  res.render('into-the-woods', {
    title : 'Bechdel Test Visualizer'
  });

});

module.exports = router;
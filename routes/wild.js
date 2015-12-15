var express = require('express');
var router = express.Router();

/* GET films listing. */
router.get('/', function(req, res, next) {
  res.render('wild', {
    title : 'Wild'
  });

});

module.exports = router;
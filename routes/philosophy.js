var express = require('express');
var router = express.Router();

/* GET Philosophy page. */
router.get('/', function(req, res, next) {
  res.render('philosophy', { title: 'Philosophy' });
});

module.exports = router;

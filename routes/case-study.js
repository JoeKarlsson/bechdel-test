var express = require('express');
var router = express.Router();

/* GET Philosophy page. */
router.get('/', function(req, res, next) {
  res.render('case-study', { title: 'Case Study' });
});

module.exports = router;

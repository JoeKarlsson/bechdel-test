var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title : 'Bechdel Test Visualizer'
  });
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('about', { title : 'About' });
});

/* GET Contact page. */
router.get('/contact', function(req, res, next) {
  res.render('contact', {
    title : 'Contact'
  });
});

/* GET Case Study page. */
router.get('/case-study', function(req, res, next) {
  res.render('case-study', { title : 'Case Study' });
});

/* GET Philosophy page. */
router.get('/philosophy', function(req, res, next) {
  res.render('philosophy', { title: 'Philosophy' });
});

module.exports = router;
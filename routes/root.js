'use strict'

var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index', { title : 'Bechdel Test Visualizer' });
});

router.get('/about', (req, res, next) => {
  res.render('about', { title : 'About' });
});

router.get('/contact', (req, res, next) => {
  res.render('contact', { title : 'Contact' });
});

router.get('/case-study', (req, res, next) => {
  res.render('case-study', { title : 'Case Study' });
});

router.get('/philosophy', (req, res, next) => {
  res.render('philosophy', { title : 'Philosophy' });
});

module.exports = router;
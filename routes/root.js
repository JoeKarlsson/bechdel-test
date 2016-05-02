'use strict';

var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title : 'Bechdel Test Visualizer' });
});

router.get('/about', (req, res) => {
  res.render('about', { title : 'About' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { title : 'Contact' });
});

router.get('/case-study', (req, res) => {
  res.render('case-study', { title : 'Case Study' });
});

router.get('/philosophy', (req, res) => {
  res.render('philosophy', { title : 'Philosophy' });
});

module.exports = router;
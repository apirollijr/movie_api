const express = require('express');
const router = express.Router();
const passport = require('passport');
const Models = require('../models.js');
const Movies = Models.Movie;

const authenticate = passport.authenticate('jwt', { session: false });

router.get('/', authenticate, async (req, res) => {
  try {
    const movies = await Movies.find();
    res.json(movies);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/:title', authenticate, async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.title });
    if (!movie) return res.status(404).send('Movie not found');
    res.json(movie);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;

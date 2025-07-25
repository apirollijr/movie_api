const express = require('express');
const router = express.Router();
const passport = require('passport');
const Movie = require('../models/movie');
const User = require('../models/user');

const authenticate = passport.authenticate('jwt', { session: false });
// const authenticate = (req, res, next) => next(); // TEMP: disable auth


router.get('/', authenticate, async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/:title', authenticate, async (req, res) => {
  try {
    const movie = await Movie.findOne({ Title: req.params.title });
    if (!movie) return res.status(404).send('Movie not found');
    res.json(movie);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;


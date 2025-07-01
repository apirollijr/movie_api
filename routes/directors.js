const express = require('express');
const router = express.Router();
const passport = require('passport');
const Movie = require('../models/movie');
const User = require('../models/user');

const authenticate = passport.authenticate('jwt', { session: false });

router.get('/:name', authenticate, async (req, res) => {
  try {
    const movie = await Movie.findOne({ 'Director.Name': req.params.name });
    if (!movie) return res.status(404).send('Director not found');
    res.json(movie.Director);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;

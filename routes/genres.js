const express = require('express');
const router = express.Router();
const passport = require('passport');
const Models = require('../models.js');
const Movies = Models.Movie;

const authenticate = passport.authenticate('jwt', { session: false });

router.get('/:name', authenticate, async (req, res) => {
  try {
    const movie = await Movies.findOne({ 'Genre.Name': req.params.name });
    if (!movie) return res.status(404).send('Genre not found');
    res.json(movie.Genre);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;

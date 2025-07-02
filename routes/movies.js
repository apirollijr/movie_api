// const express = require('express');
// const router = express.Router();
// const passport = require('passport');
// const Movie = require('../models/movie');
// const User = require('../models/user');

// const authenticate = passport.authenticate('jwt', { session: false });

// router.get('/', authenticate, async (req, res) => {
//   try {
//     const movies = await Movie.find();
//     res.json(movies);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });

// router.get('/:title', authenticate, async (req, res) => {
//   try {
//     const movie = await Movie.findOne({ Title: req.params.title });
//     if (!movie) return res.status(404).send('Movie not found');
//     res.json(movie);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Movies route is working!');
});

module.exports = router;


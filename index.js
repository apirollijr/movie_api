const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));
app.use(passport.initialize());


const authenticate = passport.authenticate('local', { session: false });

require('./passport');
require('./auth')(app);

app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

app.get('/movies', authenticate, async (req, res) => {
  try {
    const movies = await Movies.find();
    res.json(movies);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/movies/:title', authenticate, async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.title });
    if (!movie) return res.status(404).send('Movie not found');
    res.json(movie);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/genres/:name', authenticate, async (req, res) => {
  try {
    const movie = await Movies.findOne({ 'Genre.Name': req.params.name });
    if (!movie) return res.status(404).send('Genre not found');
    res.json(movie.Genre);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/directors/:name', authenticate, async (req, res) => {
  try {
    const movie = await Movies.findOne({ 'Director.Name': req.params.name });
    if (!movie) return res.status(404).send('Director not found');
    res.json(movie.Director);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/users',
  [
    check('Username', 'Username is required').notEmpty(),
    check('Username', 'Username must be at least 5 characters').isLength({ min: 5 }),
    check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').notEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { Username, Password, Email, Birthday } = req.body;
    try {
      const existingUser = await Users.findOne({ Username });
      if (existingUser) return res.status(400).send('Username already exists');

      const hashedPassword = Users.hashPassword(Password);
      const newUser = await Users.create({ Username, Password: hashedPassword, Email, Birthday });
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).send('Error: ' + err.message);
    }
});

app.put('/users/:username', authenticate,
  [
    check('Username').optional().isLength({ min: 5 }),
    check('Username').optional().isAlphanumeric(),
    check('Password').optional().notEmpty(),
    check('Email').optional().isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { Username, Password, Email, Birthday } = req.body;
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.username },
        {
          $set: {
            Username,
            Password: Password ? Users.hashPassword(Password) : undefined,
            Email,
            Birthday
          }
        },
        { new: true }
      );
      if (!updatedUser) return res.status(404).send('User not found');
      res.json(updatedUser);
    } catch (err) {
      res.status(500).send('Error: ' + err.message);
    }
});

app.post('/users/:username/favorites/:movieID', authenticate, async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $addToSet: { FavoriteMovies: req.params.movieID } },
      { new: true }
    );
    if (!updatedUser) return res.status(404).send('User not found');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.delete('/users/:username/favorites/:movieID', authenticate, async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $pull: { FavoriteMovies: req.params.movieID } },
      { new: true }
    );
    if (!updatedUser) return res.status(404).send('User not found');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.delete('/users/:username', authenticate, async (req, res) => {
  try {
    const deletedUser = await Users.findOneAndDelete({ Username: req.params.username });
    if (!deletedUser) return res.status(404).send('User not found');
    res.send('User was deleted');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
});

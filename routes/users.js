const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');

// Register a new user
router.post(
  '/',
  [
    body('Username')
      .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long')
      .isAlphanumeric().withMessage('Username must be alphanumeric'),
    body('Password')
      .not().isEmpty().withMessage('Password is required'),
    body('Email')
      .isEmail().withMessage('Email is not valid')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const hashedPassword = User.hashPassword(req.body.Password);

    try {
      const existingUser = await User.findOne({ Username: req.body.Username });
      if (existingUser) return res.status(400).send('Username already exists');

      const newUser = await User.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      });

      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).send(`Error: ${err}`);
    }
  }
);

// Get all users (protected)
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send(`Error: ${err}`);
  }
});

// Get a user by username (protected)
router.get('/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findOne({ Username: req.params.Username });
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (err) {
    res.status(500).send(`Error: ${err}`);
  }
});

// Update user (protected)
router.put(
  '/:Username',
  passport.authenticate('jwt', { session: false }),
  [
    body('Username').optional().isLength({ min: 5 }).isAlphanumeric(),
    body('Password').optional().not().isEmpty(),
    body('Email').optional().isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const updatedFields = { ...req.body };

    if (updatedFields.Password) {
      updatedFields.Password = User.hashPassword(updatedFields.Password);
    }

    try {
      const updatedUser = await User.findOneAndUpdate(
        { Username: req.params.Username },
        { $set: updatedFields },
        { new: true }
      );

      res.json(updatedUser);
    } catch (err) {
      res.status(500).send(`Error: ${err}`);
    }
  }
);

// Add a movie to favorites
router.post('/:Username/favorites/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { Username: req.params.Username },
      { $addToSet: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).send(`Error: ${err}`);
  }
});

// Remove a movie from favorites
router.delete('/:Username/favorites/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).send(`Error: ${err}`);
  }
});

// Delete user
router.delete('/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ Username: req.params.Username });

    if (!deletedUser) return res.status(404).send('User not found');
    res.send(`${req.params.Username} was deleted`);
  } catch (err) {
    res.status(500).send(`Error: ${err}`);
  }
});

module.exports = router;

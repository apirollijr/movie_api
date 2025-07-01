const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const Models = require('../models.js');
const Users = Models.User;

const authenticate = passport.authenticate('jwt', { session: false });

router.post('/',
  [
    check('Username').notEmpty().isLength({ min: 5 }).isAlphanumeric(),
    check('Password').notEmpty(),
    check('Email').isEmail()
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

router.put('/:username', authenticate,
  [
    check('Username').optional().isLength({ min: 5 }).isAlphanumeric(),
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

router.post('/:username/favorites/:movieID', authenticate, async (req, res) => {
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

router.delete('/:username/favorites/:movieID', authenticate, async (req, res) => {
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

router.delete('/:username', authenticate, async (req, res) => {
  try {
    const deletedUser = await Users.findOneAndDelete({ Username: req.params.username });
    if (!deletedUser) return res.status(404).send('User not found');
    res.send('User was deleted');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

module.exports = router;

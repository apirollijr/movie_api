const jwt = require('jsonwebtoken');
const passport = require('passport');
const express = require('express');

const router = express.Router();
const { jwtSecret } = require('./passport');

module.exports = (app) => {
  app.use(passport.initialize());

  app.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Login failed',
          error: info || error
        });
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login error', error: err });
        }

        const token = jwt.sign(
          {
            _id: user._id,
            Username: user.Username
          },
          jwtSecret,
          { expiresIn: '7d' }
        );

        return res.json({
          user: {
            Username: user.Username,
            Email: user.Email,
            FavoriteMovies: user.FavoriteMovies
          },
          token: token
        });
      });
    })(req, res, next);
  });
};

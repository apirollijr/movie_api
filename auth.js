
const Models = require('./models');
const Users = Models.User;
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./passport');
const hashedPassword = Users.hashPassword(req.body.Password);

/**
 * Auth module containing authentication-related endpoints and middleware
 * @param {Object} app - Express application instance
 * @returns {Object} Authentication module
 */
module.exports = (app) => {
  /**
   * POST /login - Authenticate a user and generate a JWT token
   * 
   * @param {string} Username - The user's username
   * @param {string} Password - The user's password
   * @returns {Object} User object and JWT token
   */
  app.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      // Handle authentication errors
      if (error || !user) {
        return res.status(400).json({
          message: info ? info.message : 'Login failed',
          user: user
        });
      }

      // User authenticated successfully, generate JWT
      req.login(user, { session: false }, (err) => {
        if (err) {
          return next(err);
        }
        
        // Create JWT payload
        const payload = {
          _id: user._id,
          Username: user.Username
        };
        
        // Generate token with 7-day expiration
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
        
        // Return user data and token
        return res.json({ 
          user: {
            Username: user.Username,
            Email: user.Email,
            Birthday: user.Birthday,
            FavoriteMovies: user.FavoriteMovies
          },
          token: token 
        });
      });
    })(req, res, next);
  });

  /**
   * Authentication middleware to protect routes
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  const authenticateJWT = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (error, user, info) => {
      if (error) {
        return next(error);
      }
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      req.user = user;
      return next();
    })(req, res, next);
  };

  // Export authentication helper methods
  return {
    authenticateJWT
  };
};
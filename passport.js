const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const Models = require('./models.js');
const Users = Models.User;

// JWT secret key - in production, use environment variables
const jwtSecret = 'anthony'; // This should be in a config file in a real app

/**
 * Local strategy for username/password authentication
 */
passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  async (username, password, callback) => {
    try {
      // Find user by username
      const user = await Users.findOne({ Username: username });
      
      // User not found
      if (!user) {
        return callback(null, false, { message: 'Incorrect username.' });
      }

      // Validate password (in a real app, compare hashed passwords)
      if (user.Password !== password) {
        return callback(null, false, { message: 'Incorrect password.' });
      }

      // User authenticated successfully
      return callback(null, user);
    } catch (error) {
      return callback(error);
    }
  }
));

/**
 * JWT strategy for token-based authentication
 */
passport.use(new JWTStrategy(
  {
    // Extract JWT from Authorization header (Bearer token)
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret
  },
  async (jwtPayload, callback) => {
    try {
      // Find user by ID from JWT payload
      const user = await Users.findById(jwtPayload._id);
      
      // User not found
      if (!user) {
        return callback(null, false);
      }
      
      // User found, pass the user to the next middleware
      return callback(null, user);
    } catch (error) {
      return callback(error);
    }
  }
));

// Export the JWT secret for use in other files
module.exports = {
  jwtSecret
};
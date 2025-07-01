const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const User = require('./models/user');

const bcrypt = require('bcrypt');

// JWT secret key - in production, use environment variables
const jwtSecret = 'anthony'; // This should be in a config file in a real app

/**
 * Local strategy for username/password authentication
 */
passport.use(new LocalStrategy(
  {
    usernameField: 'Username',
    passwordField: 'Password'
  },
  async (username, password, callback) => {
    try {
      const user = await User.findOne({ Username: username });
      if (!user) {
        return callback(null, false, { message: 'Incorrect username.' });
      }

      const isValid = await bcrypt.compare(password, user.Password);
      if (!isValid) {
        return callback(null, false, { message: 'Incorrect password.' });
      }

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
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret
  },
  async (jwtPayload, callback) => {
    try {
      const user = await User.findById(jwtPayload._id);
      if (!user) {
        return callback(null, false);
      }
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

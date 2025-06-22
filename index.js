const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

require('./passport');

mongoose.connect('mongodb://localhost:27017/movieapi', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

const app = express();
const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
});

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

app.use(passport.initialize());
require('./auth')(app);

const authenticate = passport.authenticate('jwt', { session: false });

app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// Register new user
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
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { Username, Password, Email, Birthday } = req.body;

    try {
      const userExists = await Users.findOne({ Username });
      if (userExists) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = Users.hashPassword(Password);

      const user = await Users.create({
        Username,
        Password: hashedPassword,
        Email,
        Birthday
      });

      res.status(201).json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error: ' + err.message });
    }
});

// Update user info
app.put('/users/:username',
  authenticate,
  [
    check('Username').optional().isLength({ min: 5 }).withMessage('Username must be at least 5 characters'),
    check('Username').optional().isAlphanumeric().withMessage('Username contains non-alphanumeric characters'),
    check('Password').optional().notEmpty().withMessage('Password is required'),
    check('Email').optional().isEmail().withMessage('Email must be valid')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { Username, Password, Email, Birthday } = req.body;

    try {
      const updateData = {};
      if (Username) updateData.Username = Username;
      if (Password) updateData.Password = Users.hashPassword(Password);
      if (Email) updateData.Email = Email;
      if (Birthday) updateData.Birthday = Birthday;

      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.username },
        { $set: updateData },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: `User "${req.params.username}" not found` });
      }

      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error: ' + err.message });
    }
});

// Add other routes (GET /movies, /directors, favorites, etc.) below...

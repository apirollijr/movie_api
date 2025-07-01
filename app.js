require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Passport and Auth setup
require('./passport');
require('./auth')(app);

// Middleware
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));
app.use(passport.initialize());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// Route modules
app.use('/movies', require('./routes/movies'));
app.use('/users', require('./routes/users'));
app.use('/genres', require('./routes/genres'));
app.use('/directors', require('./routes/directors'));

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
});

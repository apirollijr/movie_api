const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const path = require('path');

// Import passport configuration file
require('./passport');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/movieapi', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Import models
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

// Initialize Express app
const app = express();
const port = process.env.PORT || 8080;

// Middleware setup
app.use(morgan('common')); // Logging
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cors()); // Enable CORS for all routes
app.use(express.static('public')); // Serve static files from public directory

// Initialize Passport
app.use(passport.initialize());

// Import auth module and pass app to it
const auth = require('./auth')(app);

// Create a reusable authentication middleware
const authenticate = passport.authenticate('jwt', { session: false });

// Default route - public
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// GET all movies (protected route)
app.get('/movies', authenticate, async (req, res) => {
  try {
    const movies = await Movies.find();
    res.json(movies);
  } catch (err) {
    console.error('❌ GET /movies failed:', err);
    res.status(500).send('Error retrieving movies');
  }
});

// GET movie by title (protected route)
app.get('/movies/:title', authenticate, async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.title });
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).send('Movie not found');
    }
  } catch (err) {
    res.status(500).send('Error retrieving movie');
  }
});

// GET genre by name (protected route)
app.get('/genres/:name', authenticate, async (req, res) => {
  try {
    const movies = await Movies.find({
      'Genre.Name': {$regex: new RegExp('^' + req.params.name + '$', 'i')}
    });
    
    if (movies.length > 0) {
      // Extract genre from the first movie that matches
      const genre = movies[0].Genre;
      res.status(200).json(genre);
    } else {
      res.status(404).json({ message: `Genre "${req.params.name}" not found` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error: ' + err.message });
  }
});

// GET director by name (protected route)
app.get('/directors/:name', authenticate, async (req, res) => {
  try {
    const movies = await Movies.find({
      'Director.Name': {$regex: new RegExp(req.params.name, 'i')}
    });
    
    if (movies.length > 0) {
      // Extract director from the first movie that matches
      const director = movies[0].Director;
      res.json(director);
    } else {
      res.status(404).json({ message: `Director "${req.params.name}" not found` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error: ' + err.message });
  }
});

// Register new user (public route - no authentication required)
app.post('/users', async (req, res) => {
  const { Username, Password, Email, Birthday } = req.body;

  // Validation
  if (!Username || !Password || !Email || !Birthday) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if username already exists
    const userExists = await Users.findOne({ Username: Username });
    
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Create new user using Mongoose
    const user = await Users.create({
      Username: Username,
      Password: Password, // Note: In production, you should hash this password
      Email: Email,
      Birthday: Birthday
    });
    
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error: ' + err.message });
  }
});

// Update user information (protected route)
app.put('/users/:username', authenticate, async (req, res) => {
  const { Username, Password, Email, Birthday } = req.body;

  try {
    // Find the user by username
    const user = await Users.findOne({ Username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ message: `User "${req.params.username}" not found` });
    }

    // Build update object with only the fields that are provided
    const updateData = {};
    if (Username) updateData.Username = Username;
    if (Password) updateData.Password = Password;
    if (Email) updateData.Email = Email;
    if (Birthday) updateData.Birthday = Birthday;
    
    // Use findOneAndUpdate to update the user
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $set: updateData },
      { new: true } // This returns the updated document
    );
    
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error: ' + err.message });
  }
});

// Add movie to favorites (protected route)
app.post('/users/:username/favorites/:movieID', authenticate, async (req, res) => {
  try {
    // Find the user by username
    const user = await Users.findOne({ Username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ message: `User "${req.params.username}" not found` });
    }

    // Check if the movie exists
    const movie = await Movies.findById(req.params.movieID);
    
    if (!movie) {
      return res.status(404).json({ message: `Movie with ID "${req.params.movieID}" not found` });
    }

    // Check if movie is already in favorites
    if (user.FavoriteMovies.includes(req.params.movieID)) {
      return res.status(400).json({ message: `Movie "${movie.Title}" is already in favorites` });
    }

    // Add movie to favorites using $push operator
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $push: { FavoriteMovies: req.params.movieID } },
      { new: true } // Return the updated document
    );
    
    res.json({
      message: `Movie "${movie.Title}" added to ${req.params.username}'s favorites`,
      FavoriteMovies: updatedUser.FavoriteMovies
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error: ' + err.message });
  }
});

// Remove movie from favorites (protected route)
app.delete('/users/:username/favorites/:movieID', authenticate, async (req, res) => {
  try {
    // Find the user by username
    const user = await Users.findOne({ Username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ message: `User "${req.params.username}" not found` });
    }

    // Check if the movie exists
    const movie = await Movies.findById(req.params.movieID);
    
    if (!movie) {
      return res.status(404).json({ message: `Movie with ID "${req.params.movieID}" not found` });
    }

    // Check if movie is in favorites
    if (!user.FavoriteMovies.includes(req.params.movieID)) {
      return res.status(400).json({ message: `Movie "${movie.Title}" is not in favorites` });
    }

    // Remove movie from favorites using $pull operator
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $pull: { FavoriteMovies: req.params.movieID } },
      { new: true } // Return the updated document
    );
    
    res.json({
      message: `Movie "${movie.Title}" removed from ${req.params.username}'s favorites`,
      FavoriteMovies: updatedUser.FavoriteMovies
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error: ' + err.message });
  }
});

// Deregister user (protected route)
app.delete('/users/:username', authenticate, async (req, res) => {
  try {
    // Find and remove the user
    const user = await Users.findOneAndRemove({ Username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ message: `User "${req.params.username}" not found` });
    }
    
    res.json({
      message: `User "${req.params.username}" has been deregistered`,
      user: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error: ' + err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
});
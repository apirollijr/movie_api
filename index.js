
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/movieapi', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const Models = require('./models.js');

const app = express();
const port = 8080;

const Movies = Models.Movie;
const Users = Models.User;

// Middleware for logging
app.use(morgan('common'));

// Middleware for parsing JSON in request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from /public
app.use(express.static('public'));

// Default GET route
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// GET all movies
app.get('/movies', async (req, res) => {
  try {
    const movies = await Movies.find();
    res.json(movies);
  } catch (err) {
    console.error('❌ GET /movies failed:', err); // Add this
    res.status(500).send('Error retrieving movies');
  }
});



// GET a single movie by title
app.get('/movies/:title', async (req, res) => {
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


// GET genre by name
app.get('/genres/:name', async (req, res) => {
  try {
    // Using Mongoose to query the database
    const movies = await Movies.find({
      'Genre.Name': {$regex: new RegExp('^' + req.params.name + '$', 'i')}
    });
    
    if (movies.length > 0) {
      // Extract the genre info from the first matching movie
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

// GET director by name
app.get('/directors/:name', async (req, res) => {
  try {
    // Using Mongoose to query the database
    const movies = await Movies.find({
      'Director.Name': {$regex: req.params.name, $options: 'i'}
    });
    
    if (movies.length > 0) {
      // Extract the director info from the first matching movie
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

// Register new user
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

// Update user information
app.put('/users/:username', async (req, res) => {
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
// Add movie to favorites
app.post('/users/:username/favorites/:movieID', async (req, res) => {
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

// Remove movie from favorites
app.delete('/users/:username/favorites/:movieID', async (req, res) => {
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

// Deregister user
app.delete('/users/:username', async (req, res) => {
  try {
    // Find and remove the user
    const user = await Users.findOneAndDelete({ Username: req.params.username });

    
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

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});



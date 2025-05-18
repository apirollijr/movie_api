const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();
const port = 8080;

// Middleware for logging
app.use(morgan('common'));

// Serve static files from /public
app.use(express.static('public'));

// Default GET route
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// /movies GET route
app.get('/movies', (req, res) => {
  res.json([
    { title: 'Inception', director: 'Christopher Nolan' },
    { title: 'The Matrix', director: 'Lana & Lilly Wachowski' },
    { title: 'Interstellar', director: 'Christopher Nolan' },
    { title: 'The Godfather', director: 'Francis Ford Coppola' },
    { title: 'Pulp Fiction', director: 'Quentin Tarantino' },
    { title: 'Fight Club', director: 'David Fincher' },
    { title: 'Forrest Gump', director: 'Robert Zemeckis' },
    { title: 'The Shawshank Redemption', director: 'Frank Darabont' },
    { title: 'The Dark Knight', director: 'Christopher Nolan' },
    { title: 'Gladiator', director: 'Ridley Scott' }
  ]);
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

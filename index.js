const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

// Sample data
const movies = [
  {
    id: '1',
    title: 'Inception',
    director: 'Christopher Nolan',
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    year: 2010,
    imageUrl: 'https://example.com/inception.jpg'
  },
  {
    id: '2',
    title: 'The Matrix',
    director: 'Lana & Lilly Wachowski',
    genre: ['Sci-Fi', 'Action'],
    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    year: 1999,
    imageUrl: 'https://example.com/matrix.jpg'
  },
  {
    id: '3',
    title: 'Interstellar',
    director: 'Christopher Nolan',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    year: 2014,
    imageUrl: 'https://example.com/interstellar.jpg'
  },
  {
    id: '4',
    title: 'The Godfather',
    director: 'Francis Ford Coppola',
    genre: ['Crime', 'Drama'],
    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    year: 1972,
    imageUrl: 'https://example.com/godfather.jpg'
  },
  {
    id: '5',
    title: 'Pulp Fiction',
    director: 'Quentin Tarantino',
    genre: ['Crime', 'Drama'],
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    year: 1994,
    imageUrl: 'https://example.com/pulpfiction.jpg'
  },
  {
    id: '6',
    title: 'Fight Club',
    director: 'David Fincher',
    genre: ['Drama', 'Thriller'],
    description: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.',
    year: 1999,
    imageUrl: 'https://example.com/fightclub.jpg'
  },
  {
    id: '7',
    title: 'Forrest Gump',
    director: 'Robert Zemeckis',
    genre: ['Drama', 'Romance', 'Comedy'],
    description: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
    year: 1994,
    imageUrl: 'https://example.com/forrestgump.jpg'
  },
  {
    id: '8',
    title: 'The Shawshank Redemption',
    director: 'Frank Darabont',
    genre: ['Drama'],
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    year: 1994,
    imageUrl: 'https://example.com/shawshank.jpg'
  },
  {
    id: '9',
    title: 'The Dark Knight',
    director: 'Christopher Nolan',
    genre: ['Action', 'Crime', 'Drama'],
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    year: 2008,
    imageUrl: 'https://example.com/darkknight.jpg'
  },
  {
    id: '10',
    title: 'Gladiator',
    director: 'Ridley Scott',
    genre: ['Action', 'Adventure', 'Drama'],
    description: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',
    year: 2000,
    imageUrl: 'https://example.com/gladiator.jpg'
  }
];

// Genre data
const genres = [
  {
    name: 'Action',
    description: 'Action films usually include high energy, big-budget physical stunts and chases, possibly with rescues, battles, fights, escapes, destructive crises, etc.'
  },
  {
    name: 'Adventure',
    description: 'Adventure films are usually exciting stories, with new experiences or exotic locales, very similar to or often paired with the action film genre.'
  },
  {
    name: 'Comedy',
    description: 'Comedy is a genre of film in which the main emphasis is on humor. These films are designed to make the audience laugh through amusement.'
  },
  {
    name: 'Crime',
    description: 'Crime films are developed around the sinister actions of criminals or mobsters, particularly bankrobbers, underworld figures, or ruthless hoodlums.'
  },
  {
    name: 'Drama',
    description: 'Drama films are serious presentations or stories with settings or life situations that portray realistic characters in conflict.'
  },
  {
    name: 'Romance',
    description: 'Romance films are romantic love stories or tales of love affairs that focus on passion, emotion, and the affectionate involvement of the main characters.'
  },
  {
    name: 'Sci-Fi',
    description: 'Science fiction films are usually scientific, visionary, comic-strip-like, and imaginative, and usually visualized through fanciful, imaginative settings, expert film production design, advanced technology gadgets, scientific developments, or by fantastic special effects.'
  },
  {
    name: 'Thriller',
    description: 'Thrillers are characterized by suspense, tension and excitement. They keep the audience on the "edge of their seats".'
  }
];

// Directors data
const directors = [
  {
    name: 'Christopher Nolan',
    bio: 'Christopher Edward Nolan CBE is a British-American film director, producer, and screenwriter.',
    birthYear: 1970,
    deathYear: null,
    movies: ['Inception', 'Interstellar', 'The Dark Knight']
  },
  {
    name: 'Lana & Lilly Wachowski',
    bio: 'Lana and Lilly Wachowski are American film and television directors, writers, and producers.',
    birthYear: 1965,
    deathYear: null,
    movies: ['The Matrix']
  },
  {
    name: 'Francis Ford Coppola',
    bio: 'Francis Ford Coppola is an American film director, producer, and screenwriter.',
    birthYear: 1939,
    deathYear: null,
    movies: ['The Godfather']
  },
  {
    name: 'Quentin Tarantino',
    bio: 'Quentin Jerome Tarantino is an American film director, screenwriter, producer, and actor.',
    birthYear: 1963,
    deathYear: null,
    movies: ['Pulp Fiction']
  },
  {
    name: 'David Fincher',
    bio: 'David Andrew Leo Fincher is an American film director.',
    birthYear: 1962,
    deathYear: null,
    movies: ['Fight Club']
  },
  {
    name: 'Robert Zemeckis',
    bio: 'Robert Lee Zemeckis is an American film director, producer, and screenwriter.',
    birthYear: 1952,
    deathYear: null,
    movies: ['Forrest Gump']
  },
  {
    name: 'Frank Darabont',
    bio: 'Frank Árpád Darabont is a French-American film director, screenwriter and producer.',
    birthYear: 1959,
    deathYear: null,
    movies: ['The Shawshank Redemption']
  },
  {
    name: 'Ridley Scott',
    bio: 'Sir Ridley Scott is an English film director and producer.',
    birthYear: 1937,
    deathYear: null,
    movies: ['Gladiator']
  }
];

// Users data
let users = [
  {
    id: '1',
    username: 'johnsmith',
    password: 'password123',
    email: 'johnsmith@example.com',
    birthDate: '1990-01-01',
    favoriteMovies: ['1', '3', '5']
  },
  {
    id: '2',
    username: 'janedoe',
    password: 'password456',
    email: 'janedoe@example.com',
    birthDate: '1985-05-15',
    favoriteMovies: ['2', '4', '6']
  }
];

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
app.get('/movies', (req, res) => {
  res.json(movies);
});

// GET a single movie by title
app.get('/movies/:title', (req, res) => {
  const movie = movies.find(m => m.title.toLowerCase() === req.params.title.toLowerCase());
  
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).json({ message: `Movie "${req.params.title}" not found` });
  }
});

// GET genre by name/title
app.get('/genres/:name', (req, res) => {
  const genre = genres.find(g => g.name.toLowerCase() === req.params.name.toLowerCase());
  
  if (genre) {
    res.json(genre);
  } else {
    res.status(404).json({ message: `Genre "${req.params.name}" not found` });
  }
});

// GET director by name
app.get('/directors/:name', (req, res) => {
  const director = directors.find(d => d.name.toLowerCase().includes(req.params.name.toLowerCase()));
  
  if (director) {
    res.json(director);
  } else {
    res.status(404).json({ message: `Director "${req.params.name}" not found` });
  }
});

// Register new user
app.post('/users', (req, res) => {
  const { username, password, email, birthDate } = req.body;

  // Validation
  if (!username || !password || !email || !birthDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Check if username already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Create new user
  const newUser = {
    id: String(users.length + 1),
    username,
    password,
    email,
    birthDate,
    favoriteMovies: []
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user info (username)
app.put('/users/:username', (req, res) => {
  const { username, password, email, birthDate } = req.body;
  const userIndex = users.findIndex(user => user.username === req.params.username);

  if (userIndex === -1) {
    return res.status(404).json({ message: `User "${req.params.username}" not found` });
  }

  // Update user fields
  const updatedUser = { ...users[userIndex] };
  
  if (username) updatedUser.username = username;
  if (password) updatedUser.password = password;
  if (email) updatedUser.email = email;
  if (birthDate) updatedUser.birthDate = birthDate;

  users[userIndex] = updatedUser;
  
  res.json(updatedUser);
});

// Add movie to favorites
app.post('/users/:username/favorites/:movieID', (req, res) => {
  const userIndex = users.findIndex(user => user.username === req.params.username);

  if (userIndex === -1) {
    return res.status(404).json({ message: `User "${req.params.username}" not found` });
  }

  const movieID = req.params.movieID;
  const movie = movies.find(m => m.id === movieID);

  if (!movie) {
    return res.status(404).json({ message: `Movie with ID "${movieID}" not found` });
  }

  // Check if movie is already in favorites
  if (users[userIndex].favoriteMovies.includes(movieID)) {
    return res.status(400).json({ message: `Movie "${movie.title}" is already in favorites` });
  }

  users[userIndex].favoriteMovies.push(movieID);
  
  res.json({
    message: `Movie "${movie.title}" added to ${req.params.username}'s favorites`,
    favoriteMovies: users[userIndex].favoriteMovies
  });
});

// Remove movie from favorites
app.delete('/users/:username/favorites/:movieID', (req, res) => {
  const userIndex = users.findIndex(user => user.username === req.params.username);

  if (userIndex === -1) {
    return res.status(404).json({ message: `User "${req.params.username}" not found` });
  }

  const movieID = req.params.movieID;
  const movie = movies.find(m => m.id === movieID);

  if (!movie) {
    return res.status(404).json({ message: `Movie with ID "${movieID}" not found` });
  }

  // Check if movie is in favorites
  const favoriteIndex = users[userIndex].favoriteMovies.indexOf(movieID);
  if (favoriteIndex === -1) {
    return res.status(400).json({ message: `Movie "${movie.title}" is not in favorites` });
  }

  users[userIndex].favoriteMovies.splice(favoriteIndex, 1);
  
  res.json({
    message: `Movie "${movie.title}" removed from ${req.params.username}'s favorites`,
    favoriteMovies: users[userIndex].favoriteMovies
  });
});

// Deregister user
app.delete('/users/:username', (req, res) => {
  const userIndex = users.findIndex(user => user.username === req.params.username);

  if (userIndex === -1) {
    return res.status(404).json({ message: `User "${req.params.username}" not found` });
  }

  const deletedUser = users[userIndex];
  users.splice(userIndex, 1);
  
  res.json({
    message: `User "${req.params.username}" has been deregistered`,
    user: deletedUser
  });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

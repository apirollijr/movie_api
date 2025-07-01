require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Movie = require('./models/movie');

mongoose.connect(process.env.MONGODB_URI, {

}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function fetchAndStoreMovies(pages) {
  try {
    for (let page = 1; page <= pages; page++) {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/popular`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: 'en-US',
        page
      }
    });

    const movies = response.data.results;

    for (let movie of movies) {
      const newMovie = new Movie({
        title: movie.title,
        overview: movie.overview,
        release_date: movie.release_date,
        genre_ids: movie.genre_ids,
        poster_path: movie.poster_path,
        tmdb_id: movie.id
      });

      await newMovie.save();
      console.log(`✅ Saved: ${movie.title}`);
        }
    }

    console.log('🎉 All movies added!');
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error fetching/saving movies:', error.message);
  }
}

fetchAndStoreMovies(500);

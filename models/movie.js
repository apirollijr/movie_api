const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,
  overview: String,
  release_date: String,
  genre_ids: [Number],
  poster_path: String,         // raw path from TMDB
  cover_image_url: String,     // full image URL (optional but useful)
  tmdb_id: Number
});

module.exports = mongoose.model('Movie', movieSchema);

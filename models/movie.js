const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  Title: String,
  Description: String,
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String,
    Birth: Date,
    Death: Date
  },
  ImagePath: String,
  Featured: Boolean
});

module.exports = mongoose.models.Movie || mongoose.model('Movie', movieSchema);

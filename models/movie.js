const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: { type: String, required: true },
    Description: { type: String }
  },
  Director: {
    Name: { type: String },
    Bio: { type: String },
    Birth: { type: Date },
    Death: { type: Date }
  },
  ImagePath: { type: String },
  Featured: { type: Boolean, default: false }
});

module.exports = mongoose.models.Movie || mongoose.model('Movie', movieSchema);


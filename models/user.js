const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: { type: Date },
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

// Hash user password before saving to DB
userSchema.statics.hashPassword = function(password) {
  return bcrypt.hashSync(password, 10);
};

// Validate entered password with hashed one in DB
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

const User = mongoose.model('User', userSchema);
module.exports = mongoose.models.User || mongoose.model('User', userSchema);


const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  correctGuesses: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema);
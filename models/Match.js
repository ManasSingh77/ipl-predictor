const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  teams: [{ type: String, required: true }], // one or two matches per day
  winner: { type: String, default: null },
  votes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    selectedTeam: String,
    confirmed: { type: Boolean, default: false }
  }]
});

module.exports = mongoose.model('Match', MatchSchema);
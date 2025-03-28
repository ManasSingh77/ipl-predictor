const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');

// Homepage
router.get('/', async (req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log('Start of Day:', startOfDay.toString());
    console.log('End of Day:', endOfDay.toString());
    
    const matches = await Match.find({ 
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    res.render('index', { matches });
  });

// Vote page - show match details and voting options
router.get('/vote/:matchId', async (req, res) => {
  const match = await Match.findById(req.params.matchId);
  res.render('vote', { match });
});

// Process vote submission
router.post('/vote/:matchId', async (req, res) => {
  const { team, confirm } = req.body;
  if (confirm !== 'yes') {
    return res.redirect('/');
  }

  const match = await Match.findById(req.params.matchId);
  const userId = req.session.user._id;
  const username = req.session.user.username; // Assuming username is stored in session

  // Check if the user has already voted
  if (match.votes.some(vote => vote.user.toString() === userId)) {
    return res.send('You have already voted for this match.');
  }

  // Save vote
  match.votes.push({ user: userId, selectedTeam: team, confirmed: true });

  // Save username in the new voteUsers array
  match.voteUsers.push({ username });

  await match.save();
  res.redirect('/');
});

// Leaderboard page
router.get('/leaderboard', async (req, res) => {
  // Rank users by percentage of correct guesses (or total correct guesses)
  const users = await User.find({}).sort({ correctGuesses: -1 });
  res.render('leaderboard', { users });
});

module.exports = router;
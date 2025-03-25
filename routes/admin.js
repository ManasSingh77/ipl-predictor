const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) {
    next();
  } else {
    res.send('Access denied. Admins only.');
  }
};

// (Optionally) Create your admin account if it doesn’t exist
router.get('/setup', async (req, res) => {
  // Run this once to create your admin account
  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    const admin = new User({ username: 'admin', password: 'admin123', isAdmin: true });
    await admin.save();
    res.send('Admin account created.');
  } else {
    res.send('Admin account already exists.');
  }
});

// Show form to add match(es)
router.get('/add-match', adminAuth, (req, res) => {
  res.render('admin/add-match');
});

// Process adding a match
router.post('/add-match', adminAuth, async (req, res) => {
  // Expecting date and teams from form. For example: team1, team2, (optional team3, team4 for second match)
  const { date, teams } = req.body; // teams can be an array or comma-separated string
  let teamsArray = [];
  if (Array.isArray(teams)) {
    teamsArray = teams;
  } else {
    teamsArray = teams.split(',').map(team => team.trim());
  }
  const match = new Match({ date: new Date(date), teams: teamsArray });
  await match.save();
  res.redirect('/admin/add-match');
});

// Show form to declare yesterday’s winner(s)
router.get('/declare-winner', adminAuth, async (req, res) => {
    // Calculate the start and end of yesterday
    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);
    
    const endOfYesterday = new Date();
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);
  
    // Find matches where the date is between start and end of yesterday
    const matches = await Match.find({
      date: { $gte: startOfYesterday, $lte: endOfYesterday }
    });
  
    res.render('admin/declare-winner', { matches });
  });

// Process winner declaration
router.post('/declare-winner', adminAuth, async (req, res) => {
  // Expecting matchId and winner
  const { matchId, winner } = req.body;
  const match = await Match.findById(matchId);
  if (match) {
    match.winner = winner;
    await match.save();
    // Update correctGuesses for each user who voted correctly
    for (let vote of match.votes) {
      if (vote.selectedTeam === winner && vote.confirmed) {
        const user = await User.findById(vote.user);
        user.correctGuesses += 1;
        await user.save();
      }
    }
    res.redirect('/admin/declare-winner');
  } else {
    res.send('Match not found');
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Show register form
router.get('/register', (req, res) => {
  res.render('register');
});

// Process registration
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    req.session.user = user;
    res.redirect('/');
  } catch (err) {
    res.send('Error registering user.');
  }
});

// Show login form
router.get('/login', (req, res) => {
  res.render('login');
});

// Process login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    req.session.user = user;
    res.redirect('/');
  } else {
    res.send('Invalid credentials');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    res.redirect('/');
  });
});

module.exports = router;
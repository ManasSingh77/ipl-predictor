require('dotenv').config(); // Load variables from .env

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();

// Connect to MongoDB using the URI from .env
connectDB();

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Express Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // using the secret from .env
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
  })
);

// Set global variables for user session
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/admin', require('./routes/admin'));

// Start Server using the port from .env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

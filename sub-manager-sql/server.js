const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const subRoutes = require('./routes');
const startScheduler = require('./scheduler');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // Essential for Render/reverse proxies

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  proxy: true
},
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// CHANGE 1: Use the variable
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // CHANGE 2: Use the variable
    res.redirect(CLIENT_URL);
  }
);

app.get('/api/user', (req, res) => {
  res.send(req.user || null);
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    // CHANGE 3: Use the variable
    res.redirect(CLIENT_URL);
  });
});

app.use('/api/subscriptions', subRoutes);

// ... rest of your sync code
sequelize.sync({ force: false }).then(() => {
  console.log('✅ Database synced');
  startScheduler();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(err => console.error('❌ DB Error:', err));
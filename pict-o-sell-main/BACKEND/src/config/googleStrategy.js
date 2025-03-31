const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
require('dotenv').config();

passport.serializeUser(function(user, cb) {
  return cb(null, user.id);
});

passport.deserializeUser(async function(id, cb) {
  try {
    let user = await User.findByPk(id);
    cb(null, user);
  } catch (error) {
    cb(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace('5173', '5000') : 'http://localhost:5000'}/api/auth/google/callback`,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ 
          where: { 
            googleId: profile.id 
          } 
        });

        if (!user) {
          // Create new user if doesn't exist
          user = await User.create({
            name: profile.displayName,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@google.com`,
            password: Math.random().toString(36).slice(-8), // Random password
            googleId: profile.id,
            profilePic: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            role: 'both'
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

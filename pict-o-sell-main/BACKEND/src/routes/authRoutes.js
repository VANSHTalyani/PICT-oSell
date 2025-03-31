const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/login?error=google-auth-failed'
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/login/google/callback?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect('/login?error=google-auth-failed');
    }
  }
);

module.exports = router;

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/login?error=google-auth-failed'
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/login/google/callback?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect('/login?error=google-auth-failed');
    }
  }
);

module.exports = router;

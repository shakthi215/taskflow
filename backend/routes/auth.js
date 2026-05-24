const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { requireAuth, signToken } = require('../middleware/auth');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const existing = await User.findOne({ email: req.body.email });
      if (existing) return res.status(409).json({ success: false, message: 'Email is already registered' });

      const user = new User({ name: req.body.name, email: req.body.email });
      user.setPassword(req.body.password);
      await user.save();

      res.status(201).json({ success: true, token: signToken(user), user: user.toSafeJSON() });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
      if (!user || !user.verifyPassword(req.body.password)) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      res.json({ success: true, token: signToken(user), user: user.toSafeJSON() });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

module.exports = router;

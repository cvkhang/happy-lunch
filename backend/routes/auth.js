const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { auth } = require('../middleware/auth');


// Register
router.post('/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('name')
      .notEmpty()
      .trim()
      .withMessage('Please enter your name')
  ],
  AuthController.register
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  AuthController.login
);

// Get current user
router.get('/me', auth, AuthController.me);

// Change password
router.put('/change-password',
  auth,
  [
    body('current_password')
      .notEmpty()
      .withMessage('Please enter current password'),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
  ],
  AuthController.changePassword
);

// Update profile
router.put('/profile',
  auth,
  [
    body('name').optional().trim(),
    body('avatar_url').optional().trim(),
    body('intro').optional(),
    body('address').optional()
  ],
  AuthController.updateProfile
);

module.exports = router;

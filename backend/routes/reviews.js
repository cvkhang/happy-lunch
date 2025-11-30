const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');
const { auth, optionalAuth } = require('../middleware/auth');


// Get all reviews (with optional auth for like status)
router.get('/', optionalAuth, ReviewController.getAllReviews);

// Get review by ID
router.get('/:id', optionalAuth, ReviewController.getReviewById);

// Create review (requires auth)
router.post('/',
  auth,
  [
    body('restaurant_id')
      .isInt()
      .withMessage('Restaurant ID is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .trim(),
    body('image_urls')
      .optional()
      .isArray()
      .withMessage('Image URLs must be an array')
  ],
  ReviewController.createReview
);

// Update review (requires auth)
router.put('/:id',
  auth,
  [
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .trim(),
    body('image_urls')
      .optional()
      .isArray()
      .withMessage('Image URLs must be an array')
  ],
  ReviewController.updateReview
);

// Delete review (requires auth)
router.delete('/:id', auth, ReviewController.deleteReview);

// Like review (requires auth)
router.post('/:id/like', auth, ReviewController.likeReview);

// Unlike review (requires auth)
router.delete('/:id/unlike', auth, ReviewController.unlikeReview);

module.exports = router;

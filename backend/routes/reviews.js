const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');
const { auth, optionalAuth } = require('../middleware/auth');
// Get all reviews (optional auth for like status)
router.get('/', optionalAuth, ReviewController.getAllReviews);

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
      .withMessage('Image URLs must be an array'),
    body('dish_names')
      .optional()
      .isArray()
      .withMessage('Dish names must be an array')
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
      .withMessage('Image URLs must be an array'),
    body('dish_names')
      .optional()
      .isArray()
      .withMessage('Dish names must be an array')
  ],
  ReviewController.updateReview
);

// Delete review (requires auth)
router.delete('/:id', auth, ReviewController.deleteReview);

// Get review by ID (optional auth for like status)
router.get('/:id', optionalAuth, ReviewController.getReviewById);

// Like review (requires auth)
router.post('/:id/like', auth, ReviewController.likeReview);

// Unlike review (requires auth)
router.delete('/:id/unlike', auth, ReviewController.unlikeReview);

module.exports = router;

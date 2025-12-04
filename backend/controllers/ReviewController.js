const { validationResult } = require('express-validator');
const ReviewRepository = require('../repositories/ReviewRepository');
const { Restaurant, Notification, Review } = require('../models');

class ReviewController {
  async getAllReviews(req, res) {
    try {
      const filters = {
        restaurant_id: req.query.restaurant_id,
        user_id: req.query.user_id,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        status: req.query.user_id ? null : 'approved' // Show all reviews for user profile, otherwise only approved
      };

      const result = await ReviewRepository.findAll(filters);

      // Add like count and user's like status
      const reviewsWithLikes = result.reviews.map(review => {
        const reviewData = review.toJSON();
        reviewData.like_count = reviewData.ReviewLikes?.length || 0;
        reviewData.liked_by_user = req.user
          ? reviewData.ReviewLikes?.some(like => like.user_id === req.user.id)
          : false;
        delete reviewData.ReviewLikes;
        return reviewData;
      });

      res.json({
        success: true,
        reviews: reviewsWithLikes,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          total_pages: result.totalPages
        }
      });
    } catch (error) {
      console.error('Get reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async getReviewById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const review = await ReviewRepository.findById(id, userId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      res.json({
        success: true,
        review
      });
    } catch (error) {
      console.error('Get review error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async createReview(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { restaurant_id, rating, comment } = req.body;
      let { image_urls } = req.body;
      const user_id = req.user.id;


      // Check if restaurant exists
      const restaurant = await Restaurant.findByPk(restaurant_id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      const review = await ReviewRepository.create({
        user_id,
        restaurant_id,
        rating,
        comment,
        image_urls: image_urls || [],
        dish_names: req.body.dish_names || []
      });

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        review
      });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      let { image_urls } = req.body;

      // Check ownership
      const isOwner = await ReviewRepository.isOwner(id, req.user.id);
      if (!isOwner && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      const updateData = {};
      if (rating) updateData.rating = rating;
      if (comment !== undefined) updateData.comment = comment;


      if (image_urls !== undefined) updateData.image_urls = image_urls;
      if (req.body.dish_names !== undefined) updateData.dish_names = req.body.dish_names;

      const review = await ReviewRepository.update(id, updateData);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      res.json({
        success: true,
        message: 'Review updated successfully',
        review
      });
    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async deleteReview(req, res) {
    try {
      const { id } = req.params;

      // Check ownership
      const isOwner = await ReviewRepository.isOwner(id, req.user.id);
      if (!isOwner && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      const result = await ReviewRepository.delete(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async likeReview(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const exists = await ReviewRepository.exists(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      const result = await ReviewRepository.like(id, user_id);

      if (result.alreadyLiked) {
        return res.status(400).json({
          success: false,
          message: 'Already liked'
        });
      }

      // Create notification for the review owner
      const review = await ReviewRepository.findById(id);
      if (review && review.user_id !== user_id) {
        await Notification.create({
          user_id: review.user_id,
          type: 'like_review',
          reference_id: id,
          message: 'あなたのレビューが「いいね」されました！',
          is_read: false
        });
      }

      res.json({
        success: true,
        message: 'Liked successfully'
      });
    } catch (error) {
      console.error('Like review error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async unlikeReview(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const result = await ReviewRepository.unlike(id, user_id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Like not found'
        });
      }

      res.json({
        success: true,
        message: 'Unliked successfully'
      });
    } catch (error) {
      console.error('Unlike review error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = new ReviewController();

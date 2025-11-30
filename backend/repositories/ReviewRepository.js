const { Review, User, Restaurant, ReviewLike } = require('../models');
const { Op } = require('sequelize');

class ReviewRepository {
  /**
   * Find all reviews with filters and pagination
   */
  async findAll(filters = {}) {
    const { restaurant_id, user_id, status, page = 1, limit = 10 } = filters;
    const whereClause = {};

    if (restaurant_id) whereClause.restaurant_id = restaurant_id;
    if (user_id) whereClause.user_id = user_id;
    // if (status) whereClause.status = status; // Allow all statuses for user profile
    if (status && !user_id) whereClause.status = status; // Only filter by status if not fetching for a specific user (or adjust logic as needed)

    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar_url']
        },
        {
          model: Restaurant,
          attributes: ['id', 'name', 'address', 'image_url']
        },
        {
          model: ReviewLike,
          attributes: ['id', 'user_id'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      reviews: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Find review by ID
   */
  async findById(id, userId = null) {
    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar_url']
        },
        {
          model: Restaurant,
          attributes: ['id', 'name', 'address', 'image_url']
        },
        {
          model: ReviewLike,
          attributes: ['id', 'user_id']
        }
      ]
    });

    if (!review) return null;

    const reviewData = review.toJSON();
    reviewData.like_count = reviewData.ReviewLikes?.length || 0;
    reviewData.liked_by_user = userId
      ? reviewData.ReviewLikes?.some(like => like.user_id === userId)
      : false;
    delete reviewData.ReviewLikes;

    return reviewData;
  }

  /**
   * Create new review
   */
  async create(reviewData) {
    const review = await Review.create(reviewData);

    // Fetch the created review with associations
    return await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar_url']
        },
        {
          model: Restaurant,
          attributes: ['id', 'name', 'address']
        }
      ]
    });
  }

  /**
   * Update review
   */
  async update(id, reviewData) {
    const review = await Review.findByPk(id);
    if (!review) return null;

    await review.update(reviewData);

    // Fetch updated review with associations
    return await Review.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar_url']
        },
        {
          model: Restaurant,
          attributes: ['id', 'name', 'address']
        }
      ]
    });
  }

  /**
   * Delete review
   */
  async delete(id) {
    const review = await Review.findByPk(id);
    if (!review) return null;

    await review.destroy();
    return true;
  }

  /**
   * Check if user owns the review
   */
  async isOwner(reviewId, userId) {
    const review = await Review.findByPk(reviewId);
    return review && review.user_id === userId;
  }

  /**
   * Like a review
   */
  async like(reviewId, userId) {
    // Check if already liked
    const existingLike = await ReviewLike.findOne({
      where: { review_id: reviewId, user_id: userId }
    });

    if (existingLike) {
      return { alreadyLiked: true };
    }

    await ReviewLike.create({ review_id: reviewId, user_id: userId });
    return { success: true };
  }

  /**
   * Unlike a review
   */
  async unlike(reviewId, userId) {
    const like = await ReviewLike.findOne({
      where: { review_id: reviewId, user_id: userId }
    });

    if (!like) return null;

    await like.destroy();
    return true;
  }

  /**
   * Get reviews by restaurant
   */
  async findByRestaurant(restaurantId, page = 1, limit = 10) {
    return await this.findAll({ restaurant_id: restaurantId, status: 'approved', page, limit });
  }

  /**
   * Get reviews by user
   */
  async findByUser(userId, page = 1, limit = 10) {
    return await this.findAll({ user_id: userId, status: null, page, limit });
  }

  /**
   * Get review statistics
   */
  async getStats() {
    const totalReviews = await Review.count();
    const totalLikes = await ReviewLike.count();
    const avgRating = await Review.findAll({
      attributes: [
        [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'avgRating']
      ]
    });

    return {
      total: totalReviews,
      totalLikes,
      averageRating: parseFloat(avgRating[0]?.dataValues?.avgRating || 0).toFixed(2)
    };
  }

  /**
   * Count pending reviews
   */
  async countPending() {
    return await Review.count({ where: { status: 'pending' } });
  }

  /**
   * Check if review exists
   */
  async exists(id) {
    const review = await Review.findByPk(id);
    return !!review;
  }

  /**
   * Update review status
   */
  async updateStatus(id, status) {
    const review = await Review.findByPk(id);
    if (!review) return null;

    review.status = status;
    await review.save();
    return review;
  }
}

module.exports = new ReviewRepository();

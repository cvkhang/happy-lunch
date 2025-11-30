const ReviewRepository = require('../repositories/ReviewRepository');

class AdminReviewController {
  /**
   * Get all reviews with filters
   */
  async getReviews(req, res) {
    try {
      const filters = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        status: req.query.status,
        restaurant_id: req.query.restaurant_id,
        user_id: req.query.user_id
      };

      const result = await ReviewRepository.findAll(filters);

      res.json({
        success: true,
        reviews: result.reviews,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          total_pages: result.totalPages
        }
      });
    } catch (error) {
      console.error('Get admin reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Update review status (approve/reject)
   */
  async updateReviewStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const review = await ReviewRepository.updateStatus(id, status);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      res.json({
        success: true,
        message: `Review ${status} successfully`,
        review
      });
    } catch (error) {
      console.error('Update review status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Delete review
   */
  async deleteReview(req, res) {
    try {
      const { id } = req.params;
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
}

module.exports = new AdminReviewController();

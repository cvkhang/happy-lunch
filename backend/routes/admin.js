const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const MenuController = require('../controllers/MenuController');
const AdminUserController = require('../controllers/AdminUserController');
const { adminAuth } = require('../middleware/auth');

// ==================== MENU MANAGEMENT ====================

// Get all menu items (admin)
router.get('/menu-items', adminAuth, MenuController.getAllMenuItems);

// Get menu item by ID
router.get('/menu-items/:id', adminAuth, MenuController.getMenuItem);

// Create menu item
router.post('/menu-items',
  adminAuth,
  [
    body('restaurant_id')
      .isInt()
      .withMessage('Restaurant ID is required'),
    body('name')
      .notEmpty()
      .trim()
      .withMessage('Menu item name is required'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('description')
      .optional()
      .trim(),
    body('image_url')
      .optional()
      .isURL()
      .withMessage('Please enter a valid image URL')
  ],
  MenuController.createMenuItem
);

// Update menu item
router.put('/menu-items/:id',
  adminAuth,
  [
    body('name')
      .optional()
      .trim(),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('description')
      .optional()
      .trim(),
    body('image_url')
      .optional()
      .isURL()
      .withMessage('Please enter a valid image URL')
  ],
  MenuController.updateMenuItem
);

// Delete menu item
router.delete('/menu-items/:id', adminAuth, MenuController.deleteMenuItem);

// ==================== USER MANAGEMENT ====================

// Get all users
router.get('/users', adminAuth, AdminUserController.getAllUsers);

// Get user by ID
router.get('/users/:id', adminAuth, AdminUserController.getUserById);

// Block user
router.put('/users/:id/block', adminAuth, AdminUserController.blockUser);

// Unblock user
router.put('/users/:id/unblock', adminAuth, AdminUserController.unblockUser);

// Delete user (use with caution)
router.delete('/users/:id', adminAuth, AdminUserController.deleteUser);

// Get user statistics
router.get('/stats/users', adminAuth, AdminUserController.getUserStats);

// Update user role
router.put('/users/:id/role',
  adminAuth,
  [
    body('role')
      .isIn(['user', 'admin'])
      .withMessage('Role must be either "user" or "admin"')
  ],
  AdminUserController.updateUserRole
);

module.exports = router;

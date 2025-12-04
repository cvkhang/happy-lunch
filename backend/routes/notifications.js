const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;

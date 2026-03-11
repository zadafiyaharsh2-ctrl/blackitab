const express = require('express');
const router = express.Router();
const socialController = require('../../controllers/shared/socialController');
const authMiddleware = require('../../middleware/auth');

// Protect all social routes with authentication
router.use(authMiddleware);

// Search
router.get('/search', socialController.searchUsers);
router.get('/user/:id', socialController.getUserProfile);

// Notifications
router.get('/notifications', socialController.getNotifications);
router.get('/notifications/unread-count', socialController.getUnreadNotificationCount);
router.put('/notifications/:id/read', socialController.markNotificationAsRead);
router.delete('/notifications/:id', socialController.deleteNotification);
router.delete('/notifications', socialController.clearAllNotifications);

// Follow/Unfollow
router.post('/follow/:id', socialController.followUser);
router.post('/unfollow/:id', socialController.unfollowUser);
router.post('/accept-follow/:senderId', socialController.acceptFollowRequest);
router.post('/reject-follow/:senderId', socialController.rejectFollowRequest);

// Subscribe/Unsubscribe
router.post('/subscribe/:id', socialController.subscribeUser);
router.post('/unsubscribe/:id', socialController.unsubscribeUser);

// User Lists
router.get('/followers/:userId', socialController.getFollowers);
router.get('/following/:userId', socialController.getFollowing);

module.exports = router;

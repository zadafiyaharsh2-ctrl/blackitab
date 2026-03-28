const express = require('express');
const router = express.Router();
const socialController = require('../../controllers/shared/socialController');
const authMiddleware = require('../../middleware/auth');
const { perUserLimit } = require('../../middleware/userRateLimit');

// Protect all social routes with authentication
router.use(authMiddleware);

// Search
router.get('/search', perUserLimit({ max: 30, windowMs: 60000, feature: 'search' }), socialController.searchUsers);
router.get('/user/:id', socialController.getUserProfile);

// Notifications
router.get('/notifications', socialController.getNotifications);
router.get('/notifications/unread-count', socialController.getUnreadNotificationCount);
router.put('/notifications/:id/read', socialController.markNotificationAsRead);
router.delete('/notifications/:id', socialController.deleteNotification);
router.delete('/notifications', socialController.clearAllNotifications);

// Follow/Unfollow
router.post('/follow/:id', perUserLimit({ max: 30, windowMs: 60000, feature: 'follows' }), socialController.followUser);
router.post('/unfollow/:id', perUserLimit({ max: 30, windowMs: 60000, feature: 'follows' }), socialController.unfollowUser);
router.post('/accept-follow/:senderId', socialController.acceptFollowRequest);
router.post('/reject-follow/:senderId', socialController.rejectFollowRequest);

// Subscribe/Unsubscribe
router.post('/subscribe/:id', socialController.subscribeUser);
router.post('/unsubscribe/:id', socialController.unsubscribeUser);

// User Lists
router.get('/followers/:userId', socialController.getFollowers);
router.get('/following/:userId', socialController.getFollowing);

// Remove Follower
router.post('/remove-follower/:userId', socialController.removeFollower);

module.exports = router;

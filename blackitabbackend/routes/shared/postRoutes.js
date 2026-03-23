const express = require('express');
const router = express.Router();
const { upload, createPost, getFeedParams, getUserPosts, deletePost, likePost, unlikePost, addComment, deleteComment, getStudyContent, getPaidContent, getContentById, getRecentVideos, likeComment } = require('../../controllers/shared/postController');
const protect = require('../../middleware/auth');
const { requireFeature } = require('../../middleware/featureFlags');
const { perUserLimit } = require('../../middleware/userRateLimit');

router.post('/create', protect, requireFeature('uploads'), upload.fields([
    { name: 'media', maxCount: 1 },
    { name: 'playlistThumbnail', maxCount: 1 }
]), createPost);
router.get('/feed', protect, getFeedParams);
router.get('/user/:userId', protect, getUserPosts);
router.delete('/:id', protect, deletePost); // Delete route

// Study Content Routes
router.get('/study-content', protect, getStudyContent);
router.get('/paid-content', protect, getPaidContent);
router.get('/videos', protect, getRecentVideos);
router.get('/content/:id', protect, getContentById);

// Social Interactions
router.put('/like/:id', protect, likePost);
router.put('/unlike/:id', protect, unlikePost);
router.post('/comment/:id', protect, perUserLimit({ max: 20, windowMs: 60000, feature: 'comments' }), addComment);
router.delete('/comment/:id/:commentId', protect, deleteComment);
router.put('/:id/comments/:commentId/like', protect, likeComment);

module.exports = router;

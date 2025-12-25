const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
    createPlaylist,
    getAllPlaylists,
    getUserPlaylists,
    getPlaylistById,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    updatePlaylist
} = require('../controllers/playlistController'); // Import updatePlaylist
const { upload } = require('../controllers/postController'); // Import upload instance

router.get('/all', getAllPlaylists); // Public route
router.post('/create', protect, upload.single('thumbnail'), createPlaylist);
router.put('/:id', protect, upload.single('thumbnail'), updatePlaylist); // New update route
router.get('/user/:userId', protect, getUserPlaylists);
router.get('/:id', protect, getPlaylistById);
router.post('/add', protect, addToPlaylist);
router.delete('/:playlistId/remove/:postId', protect, removeFromPlaylist);
router.delete('/:id', protect, deletePlaylist);

module.exports = router;

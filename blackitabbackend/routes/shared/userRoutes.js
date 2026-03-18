const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../../controllers/shared/userController');
const protect = require('../../middleware/auth');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blackitab_profiles',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'fill' }] // Auto-crop to square
    }
});

const upload = multer({ storage: storage });

// PUT /api/user/update-profile
router.put('/update-profile', protect, upload.single('profileImage'), userController.updateProfile);

// PUT /api/user/link-manager
router.put('/link-manager', protect, userController.linkManager);

// POST /api/user/batch/join
router.post('/batch/join', protect, userController.joinBatch);

// GET /api/user/batches — fetch all batches the student is enrolled in
router.get('/batches', protect, userController.getMyBatches);

// GET /api/user/batches/:batchId — fetch a single batch the student is enrolled in
router.get('/batches/:batchId', protect, userController.getMyBatch);

// GET /api/user/batches/:batchId/attendance — student's own attendance for a batch
router.get('/batches/:batchId/attendance', protect, userController.getMyAttendanceForBatch);

// GET /api/user/batches/:batchId/materials — student's class materials for a batch
router.get('/batches/:batchId/materials', protect, userController.getClassMaterials);

// GET /api/user/batches/:batchId/assignments — student's class assignments for a batch
router.get('/batches/:batchId/assignments', protect, userController.getClassAssignments);

// GET /api/user/batches/:batchId/exams — student's scheduled exams for a batch
router.get('/batches/:batchId/exams', protect, userController.getClassExams);

// GET /api/user/batches/:batchId/exams/:examId — student's specific exam detail
router.get('/batches/:batchId/exams/:examId', protect, userController.getClassExamDetail);

// GET /api/user/upcoming-exams - student's upcoming exams across all batches
router.get('/upcoming-exams', protect, userController.getUpcomingExams);

// GET /api/user/assignments/:id — details of assignment and submission
router.get('/assignments/:id', protect, userController.getAssignmentDetail);

// POST /api/user/assignments/:id/submit — submit an assignment
router.post('/assignments/:id/submit', protect, userController.submitAssignment);

// GET /api/user/leaderboard — XP-ranked with streak bonus
router.get('/leaderboard', protect, userController.getLeaderboard);

module.exports = router;

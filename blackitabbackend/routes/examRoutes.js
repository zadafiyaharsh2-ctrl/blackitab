const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const pdfExportController = require('../controllers/pdfExportController');
const protect = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');

// All exam routes require authentication
router.use(protect);

// ── PDF Export Routes ──
// GET /api/exams/questions/export-pdf — Download question paper as PDF
router.get('/questions/export-pdf', requireRole('teacher', 'hod', 'institute_admin'), pdfExportController.exportQuestionPaper);

// GET /api/exams/questions/preview — Preview questions for paper (JSON)
router.get('/questions/preview', requireRole('teacher', 'hod', 'institute_admin'), pdfExportController.previewQuestions);

// POST /api/exams/questions — Create a question (teacher/hod/institute_admin only)
router.post('/questions', requireRole('teacher', 'hod', 'institute_admin'), examController.createQuestion);

// GET /api/exams/questions/my — Get questions created by the logged-in user
router.get('/questions/my', requireRole('teacher', 'hod', 'institute_admin'), examController.getMyQuestions);

// GET /api/exams/questions/institute — Get all institute questions (hod/institute_admin)
router.get('/questions/institute', requireRole('hod', 'institute_admin'), examController.getInstituteQuestions);

// PUT /api/exams/questions/:id — Update a question
router.put('/questions/:id', requireRole('teacher', 'hod', 'institute_admin'), examController.updateQuestion);

// DELETE /api/exams/questions/:id — Delete a question
router.delete('/questions/:id', requireRole('teacher', 'hod', 'institute_admin'), examController.deleteQuestion);

module.exports = router;

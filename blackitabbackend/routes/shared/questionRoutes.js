const express = require('express');
const router = express.Router();
const questionController = require('../../controllers/shared/questionController');
const pdfExportController = require('../../controllers/shared/pdfExportController');
const paperCRUDController = require('../../controllers/shared/paperCRUDController');
const protect = require('../../middleware/auth');
const { requireMinRole } = require('../../middleware/roleMiddleware');

// All question routes require authentication
router.use(protect);

// ── CRUD (teacher and above) ──
router.get('/', requireMinRole('teacher'), questionController.listMyQuestions);
router.post('/', requireMinRole('teacher'), questionController.createQuestion);
router.post('/generate', requireMinRole('teacher'), questionController.generateQuestions);

// ── Institute-scoped views (HOD and above) ──
// ── Institute-scoped views (HOD and above) ──
router.get('/institute', requireMinRole('hod'), questionController.listInstituteQuestions);

// ── Question Paper (teacher and above) ──
router.get('/paper', requireMinRole('teacher'), paperCRUDController.getMyPapers);
router.post('/paper', requireMinRole('teacher'), paperCRUDController.createPaper);
router.delete('/paper/:id', requireMinRole('teacher'), paperCRUDController.deletePaper);
router.get('/paper/preview', requireMinRole('teacher'), pdfExportController.previewQuestions);
router.get('/paper/export-pdf', requireMinRole('teacher'), pdfExportController.exportQuestionPaper);

// ── Single question operations (teacher and above) ──
router.get('/:id', requireMinRole('teacher'), questionController.getQuestion);
router.put('/:id', requireMinRole('teacher'), questionController.updateQuestion);
router.delete('/:id', requireMinRole('teacher'), questionController.deleteQuestion);
router.put('/:id/publish', requireMinRole('teacher'), questionController.publishQuestion);

module.exports = router;

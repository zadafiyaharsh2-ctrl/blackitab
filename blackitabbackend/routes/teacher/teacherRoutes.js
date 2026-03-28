const express = require('express');
const router = express.Router();
const teacherController = require('../../controllers/teacher/teacherController');
const protect = require('../../middleware/auth');
const { requireMinRole } = require('../../middleware/roleMiddleware');
const { validateObjectId, requireBatchOwner } = require('../../middleware/accessControl');

// All teacher routes require auth + minimum teacher role
router.use(protect);
router.use(requireMinRole('teacher'));

// ── Phase 3: Dashboard ──
router.get('/dashboard', teacherController.getDashboard);
router.get('/ratings', teacherController.getRatings);

// ── Phase 4: Batch Management ──
router.post('/batch', teacherController.createBatch);
router.get('/batches', teacherController.getMyBatches);
router.get('/batch/:id', validateObjectId('id'), teacherController.getBatchDetail);
router.put('/batch/:id', validateObjectId('id'), requireBatchOwner, teacherController.updateBatch);
router.delete('/batch/:id', validateObjectId('id'), requireBatchOwner, teacherController.deleteBatch);
router.get('/batch/:id/students', validateObjectId('id'), requireBatchOwner, teacherController.getBatchStudents);
router.post('/batch/:id/students', validateObjectId('id'), requireBatchOwner, teacherController.addStudentsToBatch);
router.delete('/batch/:batchId/students/:studentId', validateObjectId('batchId', 'studentId'), requireBatchOwner, teacherController.removeStudentFromBatch);

// ── Batch Join Requests & Student Search ──
router.get('/batch/:id/requests', validateObjectId('id'), requireBatchOwner, teacherController.getBatchJoinRequests);
router.put('/batch/:id/requests/:requestId/approve', validateObjectId('id', 'requestId'), requireBatchOwner, teacherController.approveBatchJoinRequest);
router.put('/batch/:id/requests/:requestId/reject', validateObjectId('id', 'requestId'), requireBatchOwner, teacherController.rejectBatchJoinRequest);
router.get('/students/search', teacherController.searchStudentsInInstitute);

// ── Phase 5: Assignments ──
router.post('/assignment', teacherController.createAssignment);
router.get('/assignments', teacherController.getMyAssignments);
router.get('/assignment/:id', validateObjectId('id'), teacherController.getAssignmentDetail);
router.put('/assignment/:id', validateObjectId('id'), teacherController.updateAssignment);
router.delete('/assignment/:id', validateObjectId('id'), teacherController.deleteAssignment);
router.get('/assignment/:id/submissions', validateObjectId('id'), teacherController.getAssignmentSubmissions);
router.put('/assignment/:id/submissions/:subId/grade', validateObjectId('id', 'subId'), teacherController.gradeSubmission);
router.get('/student/:studentId/marks', validateObjectId('studentId'), teacherController.getStudentMarks);

// ── Phase 6: Feedback & Announcements ──
router.get('/feedback', teacherController.getMyFeedback);
router.get('/feedback/complaints', teacherController.getComplaints);
router.put('/feedback/:id/acknowledge', teacherController.acknowledgeFeedback);
router.post('/announce', teacherController.createAnnouncement);
router.get('/announcements', teacherController.getMyAnnouncements);

// ── Phase 7: Exam Scheduling ──
router.post('/exam', teacherController.createExam);
router.get('/exams', teacherController.getMyExams);
router.get('/exam-history', teacherController.getExamHistory);
router.get('/exam/:id', teacherController.getExamDetail);
router.put('/exam/:id', teacherController.updateExam);
router.delete('/exam/:id', teacherController.deleteExam);
router.get('/exam/:id/results', teacherController.getExamResults);

// ── Phase 8: Theory/Content ──
router.post('/content', teacherController.createContent);
router.get('/content', teacherController.getMyContent);
router.get('/content/:id', teacherController.getContentDetail);
router.put('/content/:id', teacherController.updateContent);
router.delete('/content/:id', teacherController.deleteContent);
router.put('/content/:id/visibility', teacherController.changeContentVisibility);

// ── Phase 9: HOD Department Monitoring (requireMinRole('hod') enforced in controller as extra check) ──
router.get('/department/teachers', requireMinRole('hod'), teacherController.getDepartmentTeachers);
router.get('/department/batches', requireMinRole('hod'), teacherController.getDepartmentBatches);
router.get('/department/analytics', requireMinRole('hod'), teacherController.getDepartmentAnalytics);
router.get('/department/teacher/:id/detail', requireMinRole('hod'), teacherController.getDepartmentTeacherDetail);
router.get('/department/feedback', requireMinRole('hod'), teacherController.getDepartmentFeedback);
router.get('/department/content', requireMinRole('hod'), teacherController.getDepartmentContent);

// ── Phase 10: Student Attendance System ──
router.post('/attendance', teacherController.submitAttendance);
router.get('/attendance/:classId', teacherController.getAttendanceHistory);
router.get('/attendance/:classId/analytics', teacherController.getAttendanceAnalytics);

// ── Phase 11: Class Materials ──
router.post('/batch/:batchId/materials', teacherController.createClassMaterial);
router.get('/batch/:batchId/materials', teacherController.getClassMaterials);
router.put('/material/:id', teacherController.updateClassMaterial);
router.delete('/material/:id', teacherController.deleteClassMaterial);

module.exports = router;

const User = require('../../models/User');
const Batch = require('../../models/Batch');
const Department = require('../../models/Department');
const Assignment = require('../../models/Assignment');
const AssignmentSubmission = require('../../models/AssignmentSubmission');
const Announcement = require('../../models/Announcement');
const Exam = require('../../models/Exam');
const ExamResult = require('../../models/ExamResult');
const TeacherContent = require('../../models/TeacherContent');
const TeacherScore = require('../../models/TeacherScore');
const TeacherFeedback = require('../../models/TeacherFeedback');
const ExamQuestion = require('../../models/ExamQuestion');
const Attendance = require('../../models/Attendance');
const ClassMaterial = require('../../models/ClassMaterial');
const { ROLE_HIERARCHY } = require('../../middleware/roleMiddleware');

// ══════════════════════════════════════════════════════════════
// HELPER: Check if user can manage a resource
// ══════════════════════════════════════════════════════════════
function canManage(resource, user) {
    const isOwner = resource.teacherId?.toString() === user._id.toString();
    if (isOwner) return true;
    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    if (userLevel >= ROLE_HIERARCHY['hod'] &&
        resource.instituteId?.toString() === user.instituteId?.toString()) {
        return true;
    }
    return false;
}

// ══════════════════════════════════════════════════════════════
// PHASE 3: DASHBOARD
// ══════════════════════════════════════════════════════════════

// GET /api/teacher/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user._id;
        const instituteId = req.user.instituteId;

        const [batches, questionCount, assignmentCount, examCount, feedbackStats, scores] = await Promise.all([
            Batch.countDocuments({ teacherIds: userId }),
            ExamQuestion.countDocuments({ createdBy: userId }),
            Assignment.countDocuments({ teacherId: userId }),
            Exam.countDocuments({ teacherId: userId }),
            TeacherFeedback.aggregate([
                { $match: { teacherId: userId } },
                { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
            ]),
            TeacherScore.find({ teacherId: userId }).lean()
        ]);

        const feedback = feedbackStats[0] || { avgRating: 0, count: 0 };

        res.json({
            success: true,
            data: {
                batchCount: batches,
                questionCount,
                assignmentCount,
                examCount,
                studentRating: { average: Math.round(feedback.avgRating * 10) / 10, totalReviews: feedback.count },
                instituteScores: scores,
                role: req.user.role,
                specialization: req.user.specialization || '',
                teacherSince: req.user.teacherSince
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/ratings — Detailed rating breakdown
exports.getRatings = async (req, res) => {
    try {
        const [feedbacks, scores] = await Promise.all([
            TeacherFeedback.find({ teacherId: req.user._id })
                .populate('studentId', 'name email')
                .populate('questionId', 'question subject')
                .sort({ createdAt: -1 })
                .limit(50),
            TeacherScore.find({ teacherId: req.user._id }).lean()
        ]);

        res.json({ success: true, data: { studentFeedback: feedbacks, instituteScores: scores } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// PHASE 4: BATCH & CLASSROOM MANAGEMENT
// ══════════════════════════════════════════════════════════════

// POST /api/teacher/batch
exports.createBatch = async (req, res) => {
    try {
        const { name, year, section, departmentId, subjectId } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Batch name is required' });
        if (!req.user.instituteId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        // Generate a 6-digit unique class code
        let classCode;
        let isUnique = false;
        while (!isUnique) {
            classCode = Math.floor(100000 + Math.random() * 900000).toString();
            const existing = await Batch.findOne({ classCode });
            if (!existing) isUnique = true;
        }

        const batch = await Batch.create({
            name, year, section,
            classCode,
            departmentId: departmentId || req.user.departmentId || null,
            subjectId: subjectId || null,
            instituteId: req.user.instituteId,
            teacherIds: [req.user._id]
        });

        res.status(201).json({ success: true, data: batch });
    } catch (error) {
        console.error('Create Batch Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/batches
exports.getMyBatches = async (req, res) => {
    try {
        const filter = { teacherIds: req.user._id };
        // Institute admin sees all batches in institute
        if (req.user.role === 'institute_admin') {
            filter.instituteId = req.user.instituteId;
            delete filter.teacherIds;
        }
        const batches = await Batch.find(filter)
            .populate('departmentId', 'name code')
            .populate('subjectId', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: batches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/batch/:id
exports.getBatchDetail = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate('teacherIds', 'name email role')
            .populate('studentIds', 'name email')
            .populate('departmentId', 'name code')
            .populate('subjectId', 'name');

        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
        res.json({ success: true, data: batch });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/teacher/batch/:id
exports.updateBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        if (!canManage(batch, req.user) && !batch.teacherIds.some(t => t.toString() === req.user._id.toString())) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updated = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/teacher/batch/:id
exports.deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        if (!canManage(batch, req.user) && !batch.teacherIds.some(t => t.toString() === req.user._id.toString())) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Cascade delete: remove all materials belonging to this batch
        await ClassMaterial.deleteMany({ batchId: batch._id });
        await Batch.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Batch deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/batch/:id/students
exports.getBatchStudents = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id).populate('studentIds', 'name email xp points streak rating');
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
        res.json({ success: true, data: batch.studentIds });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/teacher/batch/:id/students — Add students to batch
exports.addStudentsToBatch = async (req, res) => {
    try {
        const { studentIds } = req.body;
        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ success: false, message: 'studentIds array is required' });
        }

        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        // Add unique students
        const existing = new Set(batch.studentIds.map(s => s.toString()));
        const newStudents = studentIds.filter(id => !existing.has(id));
        batch.studentIds.push(...newStudents);
        await batch.save();

        res.json({ success: true, data: batch, added: newStudents.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/teacher/batch/:batchId/students/:studentId
exports.removeStudentFromBatch = async (req, res) => {
    try {
        const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
        if (userLevel < ROLE_HIERARCHY['hod']) {
            return res.status(403).json({ success: false, message: 'Only HOD or Institute Admin can remove students from a batch.' });
        }

        const batch = await Batch.findById(req.params.batchId);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        batch.studentIds = batch.studentIds.filter(s => s.toString() !== req.params.studentId);
        await batch.save();

        res.json({ success: true, message: 'Student removed from batch' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==============================================================================
// BATCH JOIN REQUESTS & STUDENT SEARCH
// ==============================================================================

const BatchJoinRequest = require('../../models/BatchJoinRequest');

// GET /api/teacher/batch/:id/requests
exports.getBatchJoinRequests = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
        if (!canManage(batch, req.user) && !batch.teacherIds.some(t => t.toString() === req.user._id.toString())) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const requests = await BatchJoinRequest.find({ batchId: batch._id, status: 'pending' })
            .populate('studentId', 'name email avatar isPremium createdAt')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Get Join Requests Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/teacher/batch/:id/requests/:requestId/approve
exports.approveBatchJoinRequest = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
        if (!canManage(batch, req.user) && !batch.teacherIds.some(t => t.toString() === req.user._id.toString())) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const joinRequest = await BatchJoinRequest.findOne({ _id: req.params.requestId, batchId: batch._id, status: 'pending' });
        if (!joinRequest) return res.status(404).json({ success: false, message: 'Join request not found or not pending' });

        // Add to batch if not already there
        if (!batch.studentIds.includes(joinRequest.studentId)) {
            batch.studentIds.push(joinRequest.studentId);
            await batch.save();
        }

        joinRequest.status = 'approved';
        await joinRequest.save();

        res.json({ success: true, message: 'Request approved and student added to batch' });
    } catch (error) {
        console.error('Approve Join Request Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/teacher/batch/:id/requests/:requestId/reject
exports.rejectBatchJoinRequest = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
        if (!canManage(batch, req.user) && !batch.teacherIds.some(t => t.toString() === req.user._id.toString())) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const joinRequest = await BatchJoinRequest.findOne({ _id: req.params.requestId, batchId: batch._id, status: 'pending' });
        if (!joinRequest) return res.status(404).json({ success: false, message: 'Join request not found or not pending' });

        joinRequest.status = 'rejected';
        await joinRequest.save();

        res.json({ success: true, message: 'Request rejected' });
    } catch (error) {
        console.error('Reject Join Request Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/students/search?q=searchterm
exports.searchStudentsInInstitute = async (req, res) => {
    try {
        if (!req.user.instituteId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });
        const { q } = req.query;
        if (!q || q.length < 2) return res.json({ success: true, data: [] });

        const regex = new RegExp(q, 'i');
        const students = await User.find({
            instituteId: req.user.instituteId,
            role: 'student',
            $or: [{ name: regex }, { email: regex }]
        }).select('name email avatar').limit(20);

        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Search Students Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// PHASE 5: ASSIGNMENTS
// ══════════════════════════════════════════════════════════════

// POST /api/teacher/assignment
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, batchId, questionIds, dueDate, totalMarks } = req.body;
        if (!title || !batchId) return res.status(400).json({ success: false, message: 'title and batchId are required' });
        if (!req.user.instituteId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const assignment = await Assignment.create({
            title, description, batchId,
            questionIds: questionIds || [],
            dueDate: dueDate || null,
            totalMarks: totalMarks || 0,
            status: 'draft',
            teacherId: req.user._id,
            instituteId: req.user.instituteId
        });

        res.status(201).json({ success: true, data: assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/assignments
exports.getMyAssignments = async (req, res) => {
    try {
        const filter = { teacherId: req.user._id };
        if (req.user.role === 'institute_admin') {
            filter.instituteId = req.user.instituteId;
            delete filter.teacherId;
        }
        if (req.query.status) filter.status = req.query.status;

        const assignments = await Assignment.find(filter)
            .populate('batchId', 'name year section')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: assignments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/assignment/:id
exports.getAssignmentDetail = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('batchId', 'name year section studentIds')
            .populate('questionIds');

        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

        const submissions = await AssignmentSubmission.find({ assignmentId: assignment._id })
            .populate('studentId', 'name email');

        res.json({ success: true, data: { assignment, submissions } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/teacher/assignment/:id
exports.updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
        if (!canManage(assignment, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });

        const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/teacher/assignment/:id
exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
        if (!canManage(assignment, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });

        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/assignment/:id/submissions
exports.getAssignmentSubmissions = async (req, res) => {
    try {
        const submissions = await AssignmentSubmission.find({ assignmentId: req.params.id })
            .populate('studentId', 'name email')
            .sort({ submittedAt: -1 });

        res.json({ success: true, data: submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/teacher/assignment/:id/submissions/:subId/grade
exports.gradeSubmission = async (req, res) => {
    try {
        const { score, teacherRemarks } = req.body;

        const submission = await AssignmentSubmission.findById(req.params.subId);
        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

        submission.score = score !== undefined ? score : submission.score;
        submission.teacherRemarks = teacherRemarks || submission.teacherRemarks;
        submission.gradedAt = new Date();
        await submission.save();

        res.json({ success: true, data: submission });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/student/:studentId/marks — All marks for a student
exports.getStudentMarks = async (req, res) => {
    try {
        const { studentId } = req.params;

        const [assignmentMarks, examMarks] = await Promise.all([
            AssignmentSubmission.find({ studentId })
                .populate({ path: 'assignmentId', select: 'title totalMarks batchId', populate: { path: 'batchId', select: 'name' } })
                .sort({ submittedAt: -1 }),
            ExamResult.find({ studentId })
                .populate({ path: 'examId', select: 'title totalMarks batchId scheduledAt', populate: { path: 'batchId', select: 'name' } })
                .sort({ submittedAt: -1 })
        ]);

        res.json({ success: true, data: { assignments: assignmentMarks, exams: examMarks } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// PHASE 6: FEEDBACK & ANNOUNCEMENTS
// ══════════════════════════════════════════════════════════════

// GET /api/teacher/feedback — Feedback received by me
exports.getMyFeedback = async (req, res) => {
    try {
        const feedback = await TeacherFeedback.find({ teacherId: req.user._id })
            .populate('studentId', 'name email')
            .populate('questionId', 'question subject')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/feedback/complaints
exports.getComplaints = async (req, res) => {
    try {
        const feedback = await TeacherFeedback.find({
            teacherId: req.user._id,
            isComplaint: true
        })
            .populate('studentId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/teacher/feedback/:id/acknowledge
exports.acknowledgeFeedback = async (req, res) => {
    try {
        const feedback = await TeacherFeedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });

        feedback.status = 'acknowledged';
        await feedback.save();

        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/teacher/announce — Broadcast to batch(es)
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, batchIds, type } = req.body;
        if (!title || !content || !batchIds || batchIds.length === 0) {
            return res.status(400).json({ success: false, message: 'title, content, and batchIds are required' });
        }
        if (!req.user.instituteId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const announcement = await Announcement.create({
            senderId: req.user._id,
            batchIds,
            instituteId: req.user.instituteId,
            title, content,
            type: type || 'announcement'
        });

        res.status(201).json({ success: true, data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/announcements
exports.getMyAnnouncements = async (req, res) => {
    try {
        const filter = { senderId: req.user._id };
        // Institute admin sees all announcements
        if (req.user.role === 'institute_admin') {
            filter.instituteId = req.user.instituteId;
            delete filter.senderId;
        }

        const announcements = await Announcement.find(filter)
            .populate('batchIds', 'name year section')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// PHASE 7: EXAM SCHEDULING & HISTORY
// ══════════════════════════════════════════════════════════════

// POST /api/teacher/exam
exports.createExam = async (req, res) => {
    try {
        const { title, description, batchId, questionIds, scheduledAt, duration, totalMarks } = req.body;
        if (!title || !batchId) return res.status(400).json({ success: false, message: 'title and batchId are required' });
        if (!req.user.instituteId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const exam = await Exam.create({
            title, description, batchId,
            questionIds: questionIds || [],
            scheduledAt: scheduledAt || null,
            duration: duration || 60,
            totalMarks: totalMarks || 0,
            status: scheduledAt ? 'scheduled' : 'draft',
            teacherId: req.user._id,
            instituteId: req.user.instituteId
        });

        res.status(201).json({ success: true, data: exam });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/exams
exports.getMyExams = async (req, res) => {
    try {
        const filter = { teacherId: req.user._id };
        if (req.user.role === 'institute_admin') {
            filter.instituteId = req.user.instituteId;
            delete filter.teacherId;
        }
        if (req.query.status) filter.status = req.query.status;

        const exams = await Exam.find(filter)
            .populate('batchId', 'name year section')
            .sort({ scheduledAt: -1, createdAt: -1 });

        res.json({ success: true, data: exams });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/exam/:id
exports.getExamDetail = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('batchId', 'name year section studentIds')
            .populate('questionIds');

        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        const results = await ExamResult.find({ examId: exam._id })
            .populate('studentId', 'name email')
            .sort({ score: -1 });

        res.json({ success: true, data: { exam, results } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/teacher/exam/:id
exports.updateExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
        if (!canManage(exam, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });

        const updated = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/teacher/exam/:id
exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
        if (!canManage(exam, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });

        await Exam.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Exam deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/exam/:id/results
exports.getExamResults = async (req, res) => {
    try {
        const results = await ExamResult.find({ examId: req.params.id })
            .populate('studentId', 'name email')
            .sort({ score: -1 });

        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/exam-history
exports.getExamHistory = async (req, res) => {
    try {
        const filter = { teacherId: req.user._id, status: 'completed' };
        if (req.user.role === 'institute_admin') {
            filter.instituteId = req.user.instituteId;
            delete filter.teacherId;
        }

        const exams = await Exam.find(filter)
            .populate('batchId', 'name year section')
            .sort({ scheduledAt: -1 });

        res.json({ success: true, data: exams });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// PHASE 8: TEACHER CONTENT / THEORY
// ══════════════════════════════════════════════════════════════

// POST /api/teacher/content
exports.createContent = async (req, res) => {
    try {
        const { title, content: bodyContent, subjectId, topicId, tags, visibility } = req.body;
        if (!title || !bodyContent) return res.status(400).json({ success: false, message: 'title and content are required' });
        if (!req.user.instituteId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const teacherContent = await TeacherContent.create({
            title,
            content: bodyContent,
            subjectId: subjectId || null,
            topicId: topicId || null,
            tags: tags || [],
            visibility: visibility || 'private',
            teacherId: req.user._id,
            instituteId: req.user.instituteId
        });

        res.status(201).json({ success: true, data: teacherContent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/content
exports.getMyContent = async (req, res) => {
    try {
        const filter = { teacherId: req.user._id };
        if (req.user.role === 'institute_admin') {
            filter.instituteId = req.user.instituteId;
            delete filter.teacherId;
        }
        if (req.query.visibility) filter.visibility = req.query.visibility;

        const content = await TeacherContent.find(filter)
            .populate('subjectId', 'name')
            .populate('topicId', 'name')
            .sort({ updatedAt: -1 });

        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/content/:id
exports.getContentDetail = async (req, res) => {
    try {
        const content = await TeacherContent.findById(req.params.id)
            .populate('subjectId', 'name')
            .populate('topicId', 'name')
            .populate('teacherId', 'name email');

        if (!content) return res.status(404).json({ success: false, message: 'Content not found' });

        // Visibility check
        const isOwner = content.teacherId._id.toString() === req.user._id.toString();
        const sameInstitute = content.instituteId?.toString() === req.user.instituteId?.toString();
        const userLevel = ROLE_HIERARCHY[req.user.role] || 0;

        if (content.visibility === 'private' && !isOwner && userLevel < ROLE_HIERARCHY['hod']) {
            return res.status(403).json({ success: false, message: 'This content is private' });
        }
        if (['institute', 'global_requested'].includes(content.visibility) && !sameInstitute && userLevel < ROLE_HIERARCHY['institute_admin']) {
            return res.status(403).json({ success: false, message: 'This content is restricted' });
        }

        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/teacher/content/:id
exports.updateContent = async (req, res) => {
    try {
        const content = await TeacherContent.findById(req.params.id);
        if (!content) return res.status(404).json({ success: false, message: 'Content not found' });
        if (!canManage(content, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });

        req.body.updatedAt = new Date();
        const updated = await TeacherContent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/teacher/content/:id
exports.deleteContent = async (req, res) => {
    try {
        const content = await TeacherContent.findById(req.params.id);
        if (!content) return res.status(404).json({ success: false, message: 'Content not found' });
        if (!canManage(content, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });

        await TeacherContent.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Content deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/teacher/content/:id/visibility
exports.changeContentVisibility = async (req, res) => {
    try {
        const { visibility } = req.body;
        if (!['private', 'institute', 'global_requested'].includes(visibility)) {
            return res.status(400).json({ success: false, message: 'visibility must be: private, institute, or global_requested' });
        }

        const content = await TeacherContent.findById(req.params.id);
        if (!content) return res.status(404).json({ success: false, message: 'Content not found' });
        if (!canManage(content, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });

        content.visibility = visibility;
        if (visibility === 'global_requested') {
            content.approvalStatus = 'pending';
        }
        content.updatedAt = new Date();
        await content.save();

        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// PHASE 9: HOD EXTENSIONS (Department monitoring)
// ══════════════════════════════════════════════════════════════

// GET /api/teacher/department/teachers
exports.getDepartmentTeachers = async (req, res) => {
    try {
        if (!req.user.departmentId) {
            return res.status(400).json({ success: false, message: 'Not assigned to a department' });
        }

        const teachers = await User.find({
            departmentId: req.user.departmentId,
            role: { $in: ['teacher', 'hod'] }
        }).select('name email role specialization teacherRating teacherSince');

        res.json({ success: true, data: teachers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/department/analytics
exports.getDepartmentAnalytics = async (req, res) => {
    try {
        const departmentId = req.user.departmentId;
        if (!departmentId) return res.status(400).json({ success: false, message: 'Not assigned to a department' });

        const teachers = await User.find({ departmentId, role: { $in: ['teacher', 'hod'] } }).select('_id');
        const teacherIds = teachers.map(t => t._id);

        const [questionCount, assignmentCount, examCount, batchCount, feedbackStats] = await Promise.all([
            ExamQuestion.countDocuments({ createdBy: { $in: teacherIds } }),
            Assignment.countDocuments({ teacherId: { $in: teacherIds } }),
            Exam.countDocuments({ teacherId: { $in: teacherIds } }),
            Batch.countDocuments({ teacherIds: { $in: teacherIds } }),
            TeacherFeedback.aggregate([
                { $match: { teacherId: { $in: teacherIds } } },
                { $group: { _id: '$teacherId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                teacherCount: teacherIds.length,
                questionCount, assignmentCount, examCount, batchCount,
                teacherFeedbackSummary: feedbackStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/department/teacher/:id/detail
exports.getDepartmentTeacherDetail = async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id).select('-password');
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

        const [batches, questionCount, assignmentCount, examCount, feedback, scores] = await Promise.all([
            Batch.find({ teacherIds: teacher._id }).select('name year section'),
            ExamQuestion.countDocuments({ createdBy: teacher._id }),
            Assignment.countDocuments({ teacherId: teacher._id }),
            Exam.countDocuments({ teacherId: teacher._id }),
            TeacherFeedback.find({ teacherId: teacher._id }).populate('studentId', 'name').sort({ createdAt: -1 }).limit(20),
            TeacherScore.find({ teacherId: teacher._id })
        ]);

        res.json({
            success: true,
            data: { teacher, batches, questionCount, assignmentCount, examCount, feedback, scores }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/department/feedback
exports.getDepartmentFeedback = async (req, res) => {
    try {
        const departmentId = req.user.departmentId;
        if (!departmentId) return res.status(400).json({ success: false, message: 'Not assigned to a department' });

        const teachers = await User.find({ departmentId, role: { $in: ['teacher', 'hod'] } }).select('_id');
        const teacherIds = teachers.map(t => t._id);

        const feedback = await TeacherFeedback.find({ teacherId: { $in: teacherIds } })
            .populate('teacherId', 'name email')
            .populate('studentId', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/department/content
exports.getDepartmentContent = async (req, res) => {
    try {
        const departmentId = req.user.departmentId;
        if (!departmentId) return res.status(400).json({ success: false, message: 'Not assigned to a department' });

        const teachers = await User.find({ departmentId }).select('_id');
        const teacherIds = teachers.map(t => t._id);

        const content = await TeacherContent.find({ teacherId: { $in: teacherIds } })
            .populate('teacherId', 'name email')
            .populate('subjectId', 'name')
            .sort({ updatedAt: -1 });

        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// PHASE 10: STUDENT ATTENDANCE SYSTEM
// ══════════════════════════════════════════════════════════════

// POST /api/teacher/attendance (Saves or updates attendance for a class on a specific date)
exports.submitAttendance = async (req, res) => {
    try {
        const { classId, date, records } = req.body;
        if (!classId || !date || !records || !Array.isArray(records)) {
            return res.status(400).json({ success: false, message: 'classId, date, and records array are required' });
        }
        if (!req.user.instituteId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const batch = await Batch.findById(classId);
        if (!batch) return res.status(404).json({ success: false, message: 'Class not found' });
        if (!canManage(batch, req.user) && !batch.teacherIds.some(t => t.toString() === req.user._id.toString())) {
            return res.status(403).json({ success: false, message: 'Not authorized for this class' });
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // upsert completely blocks duplicate logs and automatically handles updates on mistakes
        const attendance = await Attendance.findOneAndUpdate(
            { classId, date: attendanceDate },
            {
                instituteId: req.user.instituteId,
                teacherId: req.user._id,
                records
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Attendance already exists for this date.' });
        console.error('Submit Attendance Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/attendance/:classId
exports.getAttendanceHistory = async (req, res) => {
    try {
        if (!req.user.instituteId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });
        const batch = await Batch.findById(req.params.classId);
        if (!batch) return res.status(404).json({ success: false, message: 'Class not found' });
        if (!canManage(batch, req.user) && !batch.teacherIds.some(t => t.toString() === req.user._id.toString())) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const filter = { classId: req.params.classId, instituteId: req.user.instituteId };
        
        // Optional date filter
        if (req.query.date) {
            const date = new Date(req.query.date);
            date.setHours(0, 0, 0, 0);
            filter.date = date;
        }

        const history = await Attendance.find(filter)
            .populate('records.studentId', 'name email avatar')
            .populate('teacherId', 'name')
            .sort({ date: -1 });

        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Get Attendance History Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/attendance/:classId/analytics
exports.getAttendanceAnalytics = async (req, res) => {
    try {
        if (!req.user.instituteId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });
        const batch = await Batch.findById(req.params.classId);
        if (!batch) return res.status(404).json({ success: false, message: 'Class not found' });
        if (!canManage(batch, req.user) && !batch.teacherIds.some(t => t.toString() === req.user._id.toString())) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // The pipeline required to generate raw percentage metrics for dropdown risk and predictions
        const pipeline = [
            { $match: { classId: batch._id, instituteId: req.user.instituteId } },
            { $unwind: "$records" },
            {
                $group: {
                    _id: "$records.studentId",
                    totalClasses: { $sum: 1 },
                    presentCount: {
                        $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] }
                    },
                    lateCount: {
                        $sum: { $cond: [{ $eq: ["$records.status", "Late"] }, 1, 0] }
                    },
                    absentCount: {
                        $sum: { $cond: [{ $eq: ["$records.status", "Absent"] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    studentId: "$_id",
                    totalClasses: 1,
                    presentCount: 1,
                    lateCount: 1,
                    absentCount: 1,
                    attendancePercentage: {
                        $multiply: [
                            { $divide: ["$presentCount", "$totalClasses"] },
                            100
                        ]
                    }
                }
            },
            { $lookup: { from: "users", localField: "studentId", foreignField: "_id", as: "studentDetails" } },
            { $unwind: "$studentDetails" },
            {
                $project: {
                    _id: 1, studentId: 1, totalClasses: 1, presentCount: 1, lateCount: 1, absentCount: 1, attendancePercentage: 1,
                    "studentName": "$studentDetails.name",
                    "studentEmail": "$studentDetails.email",
                    "studentAvatar": "$studentDetails.avatar"
                }
            },
            { $sort: { attendancePercentage: 1 } } // Sort by those at most risk to drop out
        ];

        const analytics = await Attendance.aggregate(pipeline);
        res.json({ success: true, data: analytics });
    } catch (error) {
         console.error('Get Attendance Analytics Error:', error);
         res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// PHASE 11: CLASS MATERIALS
// ══════════════════════════════════════════════════════════════

// POST /api/teacher/batch/:batchId/materials
exports.createClassMaterial = async (req, res) => {
    try {
        const { title, description, content, links, files } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
        if (!req.user.instituteId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const batch = await Batch.findById(req.params.batchId);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
        if (!canManage(batch, req.user) && !batch.teacherIds.some(t => t.toString() === req.user._id.toString())) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const material = await ClassMaterial.create({
            title,
            description: description || '',
            content: content || '',
            links: Array.isArray(links) ? links : [],
            files: Array.isArray(files) ? files : [],
            batchId: batch._id,
            teacherId: req.user._id,
            instituteId: req.user.instituteId
        });

        res.status(201).json({ success: true, data: material });
    } catch (error) {
        console.error('Create Class Material Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/teacher/batch/:batchId/materials
exports.getClassMaterials = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.batchId);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
        if (!canManage(batch, req.user) && !batch.teacherIds.some(t => t.toString() === req.user._id.toString())) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const materials = await ClassMaterial.find({ batchId: batch._id })
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: materials });
    } catch (error) {
        console.error('Get Class Materials Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/teacher/material/:id
exports.updateClassMaterial = async (req, res) => {
    try {
        const material = await ClassMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
        if (!canManage(material, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });

        const { title, description, content, links, files } = req.body;
        if (title) material.title = title;
        if (description !== undefined) material.description = description;
        if (content !== undefined) material.content = content;
        if (Array.isArray(links)) material.links = links;
        if (Array.isArray(files)) material.files = files;
        material.updatedAt = new Date();
        await material.save();

        res.json({ success: true, data: material });
    } catch (error) {
        console.error('Update Class Material Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/teacher/material/:id
exports.deleteClassMaterial = async (req, res) => {
    try {
        const material = await ClassMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
        if (!canManage(material, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });

        await ClassMaterial.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Material deleted' });
    } catch (error) {
        console.error('Delete Class Material Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

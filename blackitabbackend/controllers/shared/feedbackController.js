const TeacherFeedback = require('../../models/TeacherFeedback');
const Batch = require('../../models/Batch');

// Student submits feedback for a teacher in a batch
exports.submitBatchFeedback = async (req, res) => {
    try {
        const { teacherId, batchId, rating, comment, isAnonymous } = req.body;
        const studentId = req.user._id;

        if (!teacherId || !batchId || !rating) {
            return res.status(400).json({ success: false, message: 'Teacher, class, and rating are required' });
        }

        // Verify batch exists and student is enrolled
        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        if (!batch.studentIds.includes(studentId)) {
            return res.status(403).json({ success: false, message: 'You are not enrolled in this class' });
        }

        const newFeedback = await TeacherFeedback.create({
            teacherId,
            studentId,
            batchId,
            instituteId: batch.instituteId,
            rating,
            comment,
            isAnonymous,
            feedbackType: 'class'
        });

        res.status(201).json({ success: true, message: 'Feedback submitted successfully', data: newFeedback });

    } catch (error) {
        console.error('Submit Feedback Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Teacher getting their own feedback
exports.getTeacherFeedback = async (req, res) => {
    try {
        const teacherId = req.user._id;
        // Fetch all feedback for this teacher
        const feedbacks = await TeacherFeedback.find({ teacherId, feedbackType: 'class' })
            .populate('batchId', 'name classCode year section')
            .populate('studentId', 'name profileImage email')
            .sort({ createdAt: -1 })
            .lean();

        // Hide student info if anonymous
        const data = feedbacks.map(f => {
            if (f.isAnonymous) {
                return {
                    ...f,
                    studentId: { _id: null, name: 'Anonymous Student', profileImage: null, email: null }
                };
            }
            return f;
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get Teacher Feedback Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Institute getting feedback for a specific teacher
exports.getInstituteTeacherFeedback = async (req, res) => {
    try {
        const { teacherId } = req.params;
        
        // Ensure institute can only view teachers in their institute
        let realInstituteId = req.user._id;
        if (req.user.role === 'hod' || req.user.role === 'teacher') {
            realInstituteId = req.user.instituteId;
        }

        const feedbacks = await TeacherFeedback.find({ teacherId, instituteId: realInstituteId, feedbackType: 'class' })
            .populate('batchId', 'name classCode year section')
            .populate('studentId', 'name profileImage email')
            .sort({ createdAt: -1 })
            .lean();

        // Anonymize for institute too
        const data = feedbacks.map(f => {
            if (f.isAnonymous) {
                return {
                    ...f,
                    studentId: { _id: null, name: 'Anonymous Student', profileImage: null, email: null }
                };
            }
            return f;
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error('Institute Feedback Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin getting all details unfiltered
exports.getAdminTeacherFeedback = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const feedbacks = await TeacherFeedback.find({ teacherId, feedbackType: 'class' })
            .populate('batchId', 'name classCode year section')
            .populate('instituteId', 'name')
            .populate('studentId', 'name profileImage email')
            .sort({ createdAt: -1 })
            .lean();

        // DO NOT anonymize for admin
        res.json({ success: true, data: feedbacks });
    } catch (error) {
        console.error('Admin Feedback Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const ExamQuestion = require('../models/ExamQuestion');

// POST /api/exams/questions
exports.createQuestion = async (req, res) => {
    try {
        const { exam, subject, question, options, correctAnswer, difficulty, explanation, tags, isPublic } = req.body;

        if (!exam || !subject || !question || !options || options.length !== 4 || correctAnswer === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields: exam, subject, question, 4 options, correctAnswer' });
        }

        const newQuestion = await ExamQuestion.create({
            exam,
            subject,
            question,
            options,
            correctAnswer: parseInt(correctAnswer),
            difficulty: difficulty || 'Medium',
            explanation: explanation || 'No explanation available',
            tags: tags || [],
            isPublic: isPublic !== false,
            approvalStatus: 'pending',
            createdBy: req.user._id,
            instituteId: req.user.instituteId || null,
        });

        res.status(201).json({ success: true, data: newQuestion });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/exams/questions/my
exports.getMyQuestions = async (req, res) => {
    try {
        const questions = await ExamQuestion.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: questions });
    } catch (error) {
        console.error('Get my questions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/exams/questions/institute
exports.getInstituteQuestions = async (req, res) => {
    try {
        if (!req.user.instituteId) {
            return res.status(400).json({ success: false, message: 'Not linked to an institute' });
        }
        const questions = await ExamQuestion.find({ instituteId: req.user.instituteId })
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: questions });
    } catch (error) {
        console.error('Get institute questions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/exams/questions/:id
exports.updateQuestion = async (req, res) => {
    try {
        const question = await ExamQuestion.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        // Allow update only if creator or same institute HOD/admin
        const isCreator = question.createdBy?.toString() === req.user._id.toString();
        const isSameInstituteSupervisor = ['hod', 'institute_admin'].includes(req.user.role) &&
            question.instituteId?.toString() === req.user.instituteId?.toString();

        if (!isCreator && !isSameInstituteSupervisor) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this question' });
        }

        const updates = req.body;
        if (updates.correctAnswer !== undefined) updates.correctAnswer = parseInt(updates.correctAnswer);

        const updated = await ExamQuestion.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/exams/questions/:id
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await ExamQuestion.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const isCreator = question.createdBy?.toString() === req.user._id.toString();
        const isSameInstituteSupervisor = ['hod', 'institute_admin'].includes(req.user.role) &&
            question.instituteId?.toString() === req.user.instituteId?.toString();

        if (!isCreator && !isSameInstituteSupervisor) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this question' });
        }

        await ExamQuestion.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

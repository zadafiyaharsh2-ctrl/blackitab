
const ExamQuestion = require('../../models/ExamQuestion');

// POST /api/exams/questions
exports.createQuestion = async (req, res) => {
    try {
        const { exam, subject, question, options, correctAnswer, difficulty, explanation, tags, format } = req.body;

        if (!exam || !subject || !question || !options || options.length !== 4 || correctAnswer === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields: exam, subject, question, 4 options, correctAnswer' });
        }

        const departmentId = req.user.departmentId || null;

        const newQuestion = await ExamQuestion.create({
            exam,
            subject,
            question,
            options,
            correctAnswer: parseInt(correctAnswer),
            difficulty: difficulty || 'Medium',
            explanation: explanation || 'No explanation available',
            tags: tags || [],
            format: format || 'Digital',
            status: 'Draft',
            isGlobal: false,
            createdBy: req.user._id,
            instituteId: req.user.instituteId || null,
            departmentId: departmentId,
            isModerated: false,
            isActive: true
        });

        res.status(201).json({ success: true, data: newQuestion });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/exams/questions/my
exports.getMyQuestions = async (req, res) => {
    try {
        const questions = await ExamQuestion.find({ createdBy: req.user._id, isActive: true })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: questions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/exams/questions/institute
exports.getInstituteQuestions = async (req, res) => {
    try {
        if (!req.user.instituteId) {
            return res.status(400).json({ success: false, message: 'Not linked to an institute' });
        }
        const questions = await ExamQuestion.find({ instituteId: req.user.instituteId, isActive: true })
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: questions });
    } catch (error) {
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
        const isSameInstituteSupervisor = ['hod', 'institute'].includes(req.user.role) &&
            question.instituteId?.toString() === req.user.instituteId?.toString();

        if (isCreator && question.isModerated) {
            return res.status(403).json({ success: false, message: 'Question locked by moderation. You cannot edit it.' });
        }

        if (!isCreator && !isSameInstituteSupervisor) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this question' });
        }

        const updates = req.body;
        if (!isCreator && isSameInstituteSupervisor) {
            updates.isModerated = true;
        }
        if (updates.correctAnswer !== undefined) updates.correctAnswer = parseInt(updates.correctAnswer);

        const updated = await ExamQuestion.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true, context: 'query' });

        res.json({ success: true, data: updated });
    } catch (error) {
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
        const isSameInstituteSupervisor = ['hod', 'institute'].includes(req.user.role) &&
            question.instituteId?.toString() === req.user.instituteId?.toString();

        if (isCreator && question.isModerated) {
            return res.status(403).json({ success: false, message: 'Question locked by moderation. You cannot delete it.' });
        }

        if (!isCreator && !isSameInstituteSupervisor) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this question' });
        }

        if (question.status === 'Draft') {
            await ExamQuestion.findByIdAndDelete(req.params.id);
        } else {
            question.isActive = false;
            await question.save();
        }
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/exams/questions/:id/publish
exports.publishQuestion = async (req, res) => {
    try {
        const question = await ExamQuestion.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const isCreator = question.createdBy?.toString() === req.user._id.toString();
        
        if (!isCreator) {
            return res.status(403).json({ success: false, message: 'Only the creator can publish a draft question' });
        }

        if (question.status === 'Published') {
            return res.status(400).json({ success: false, message: 'Question is already published' });
        }

        question.status = 'Published';
        await question.save();

        res.json({ success: true, message: 'Question published successfully', data: question });
    } catch (error) {
        console.error('Publish Question Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


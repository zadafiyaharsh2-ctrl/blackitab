const GeneratedQuestion = require('../models/GeneratedQuestion');
const ExamQuestion = require('../models/ExamQuestion');

// POST /api/exams/questions
exports.createQuestion = async (req, res) => {
    try {
        const { exam, subject, question, options, correctAnswer, difficulty, explanation, tags, isPublic } = req.body;

        if (!exam || !subject || !question || !options || options.length !== 4 || correctAnswer === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields: exam, subject, question, 4 options, correctAnswer' });
        }

        const newQuestion = await GeneratedQuestion.create({
            exam,
            subject,
            question,
            options,
            correctAnswer: parseInt(correctAnswer),
            difficulty: difficulty || 'Medium',
            explanation: explanation || 'No explanation available',
            tags: tags || [],
            isPublic: isPublic !== false,
            visibility: isPublic === false ? 'private' : 'public',
            approvalStatus: 'pending',
            createdBy: req.user._id,
            instituteId: req.user.instituteId || null
        });

        res.status(201).json({ success: true, data: newQuestion });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/exams/questions/my
exports.getMyQuestions = async (req, res) => {
    try {
        const questions = await GeneratedQuestion.find({ createdBy: req.user._id })
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
        const questions = await GeneratedQuestion.find({ instituteId: req.user.instituteId })
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
        const question = await GeneratedQuestion.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        // Allow update only if creator or same institute HOD/admin
        const isCreator = question.createdBy?.toString() === req.user._id.toString();
        const isSameInstituteSupervisor = ['hod', 'institute'].includes(req.user.role) &&
            question.instituteId?.toString() === req.user.instituteId?.toString();

        if (!isCreator && !isSameInstituteSupervisor) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this question' });
        }

        const updates = req.body;
        if (updates.correctAnswer !== undefined) updates.correctAnswer = parseInt(updates.correctAnswer);

        // Handle isProblem toggle — copy to / remove from ExamQuestion
        const wasProblem = question.isProblem;
        const willBeProblem = updates.isProblem !== undefined ? updates.isProblem : wasProblem;

        const updated = await GeneratedQuestion.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

        // If newly approved → copy to ExamQuestion
        if (!wasProblem && willBeProblem) {
            await _copyToExamQuestion(updated);
        }
        // If removed from Problems → delete the ExamQuestion copy
        else if (wasProblem && !willBeProblem) {
            await ExamQuestion.deleteOne({ sourceQuestionId: req.params.id });
        }
        // If still in Problems and content was edited → sync the ExamQuestion copy
        else if (wasProblem && willBeProblem) {
            await _syncExamQuestion(updated);
        }

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/exams/questions/:id
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await GeneratedQuestion.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const isCreator = question.createdBy?.toString() === req.user._id.toString();
        const isSameInstituteSupervisor = ['hod', 'institute'].includes(req.user.role) &&
            question.instituteId?.toString() === req.user.instituteId?.toString();

        if (!isCreator && !isSameInstituteSupervisor) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this question' });
        }

        // Also delete from ExamQuestion if it was in Problems
        if (question.isProblem) {
            await ExamQuestion.deleteOne({ sourceQuestionId: req.params.id });
        }

        await GeneratedQuestion.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ── Helper: Copy a GeneratedQuestion doc to ExamQuestion ──
async function _copyToExamQuestion(q) {
    const existing = await ExamQuestion.findOne({ sourceQuestionId: q._id });
    if (existing) return existing; // Already copied

    return ExamQuestion.create({
        exam: q.exam,
        subject: q.subject,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        explanation: q.explanation,
        isAiGenerated: q.isAiGenerated,
        topicId: q.topicId,
        tags: q.tags,
        createdBy: q.createdBy,
        instituteId: q.instituteId,
        isPublic: q.isPublic,
        visibility: q.visibility,
        approvalStatus: 'approved',
        isProblem: true,
        sourceQuestionId: q._id
    });
}

// ── Helper: Sync content edits to the ExamQuestion copy ──
async function _syncExamQuestion(q) {
    await ExamQuestion.findOneAndUpdate(
        { sourceQuestionId: q._id },
        {
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            subject: q.subject,
            difficulty: q.difficulty,
            exam: q.exam,
            tags: q.tags
        }
    );
}

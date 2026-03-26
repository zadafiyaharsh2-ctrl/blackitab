const QuestionPaper = require('../../models/QuestionPaper');
const ExamQuestion = require('../../models/ExamQuestion');

// CREATE a paper from current filters
exports.createPaper = async (req, res) => {
    try {
        const { exam, subject, difficulty, limit, title, includeAnswers } = req.body;
        const filter = {};
        if (exam) filter.exam = exam.toLowerCase();
        if (subject) filter.subject = { $regex: new RegExp(subject, 'i') };
        if (difficulty) filter.difficulty = difficulty;

        const user = req.user;
        if (user.role !== 'institute') {
            filter.$or = [
                { isPublic: true },
                ...(user.instituteId ? [{ instituteId: user.instituteId }] : []),
                { createdBy: user._id }
            ];
        }

        const questions = await ExamQuestion.find(filter)
            .limit(parseInt(limit) || 20)
            .sort({ difficulty: 1, createdAt: -1 })
            .select('_id')
            .lean();

        if (questions.length === 0) {
            return res.status(400).json({ success: false, message: 'No questions matched these filters. Paper not created.' });
        }

        const newPaper = new QuestionPaper({
            title: title || `${(exam || 'General').toUpperCase()} - ${subject || 'Mixed'} Question Paper`,
            exam,
            subject,
            difficulty,
            questions: questions.map(q => q._id),
            totalQuestions: questions.length,
            includeAnswers: includeAnswers !== false,
            createdBy: user._id,
            instituteId: user.instituteId || null
        });

        await newPaper.save();
        res.status(201).json({ success: true, message: 'Paper saved successfully', data: newPaper });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create paper', error: err.message });
    }
};

// GET my papers
exports.getMyPapers = async (req, res) => {
    try {
        const papers = await QuestionPaper.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: papers });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch papers', error: err.message });
    }
};

// DELETE paper
exports.deletePaper = async (req, res) => {
    try {
        const paper = await QuestionPaper.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!paper) return res.status(404).json({ success: false, message: 'Paper not found' });
        res.json({ success: true, message: 'Paper deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete paper', error: err.message });
    }
};

const ProblemSubject = require('../models/ProblemSubject');
const ProblemChapter = require('../models/ProblemChapter');
const Problem = require('../models/Problem');
const ProblemProgress = require('../models/ProblemProgress');

// @desc    Get all problem subjects
// @route   GET /api/problems/subjects
// @access  Public
exports.getProblemSubjects = async (req, res) => {
    try {
        const subjects = await ProblemSubject.find().sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects
        });
    } catch (err) {
        console.error('Error fetching problem subjects:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Create a problem subject
// @route   POST /api/problems/subjects
// @access  Private (Admin only - ideally)
exports.createProblemSubject = async (req, res) => {
    try {
        const subject = await ProblemSubject.create(req.body);

        res.status(201).json({
            success: true,
            data: subject
        });
    } catch (err) {
        console.error('Error creating problem subject:', err);
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Subject already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get chapters by subject ID
// @route   GET /api/problems/subjects/:subjectId/chapters
// @access  Public
exports.getChaptersBySubject = async (req, res) => {
    try {
        const chapters = await ProblemChapter.find({ subjectId: req.params.subjectId }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: chapters.length,
            data: chapters
        });
    } catch (err) {
        console.error('Error fetching problem chapters:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get problems by chapter ID
// @route   GET /api/problems/chapters/:chapterId/problems
// @access  Public (but we check for user if token is present)
exports.getProblemsByChapter = async (req, res) => {
    try {
        const problems = await Problem.find({ chapterId: req.params.chapterId }).sort({ order: 1 });

        // If user is logged in (we'll need to handle this in the route or assume optional auth)
        // For now, let's assume we might have req.user if auth middleware ran
        let problemsWithStatus = problems.map(p => ({ ...p.toObject(), status: 'not_attempted' }));

        if (req.user) {
            const problemIds = problems.map(p => p._id);
            const progress = await ProblemProgress.find({
                userId: req.user.id,
                problemId: { $in: problemIds }
            });

            const progressMap = {};
            progress.forEach(p => {
                progressMap[p.problemId.toString()] = p.status;
            });

            problemsWithStatus = problems.map(p => ({
                ...p.toObject(),
                status: progressMap[p._id.toString()] || 'not_attempted'
            }));
        }

        res.status(200).json({
            success: true,
            count: problemsWithStatus.length,
            data: problemsWithStatus
        });
    } catch (err) {
        console.error('Error fetching problems:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
exports.getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        res.status(200).json({
            success: true,
            data: problem
        });
    } catch (err) {
        console.error('Error fetching problem:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update problem status
// @route   POST /api/problems/:id/status
// @access  Private
exports.updateProblemStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'completed' or 'attempted'

        if (!['completed', 'attempted'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        let progress = await ProblemProgress.findOne({
            userId: req.user.id,
            problemId: req.params.id
        });

        if (progress) {
            progress.status = status;
            progress.updatedAt = Date.now();
            if (status === 'completed' && !progress.completedAt) {
                progress.completedAt = Date.now();

                // Add points for problem completion
                const User = require('../models/User');
                await User.findByIdAndUpdate(req.user.id, { $inc: { points: 20 } });
            }
            await progress.save();
        } else {
            progress = await ProblemProgress.create({
                userId: req.user.id,
                problemId: req.params.id,
                status,
                completedAt: status === 'completed' ? Date.now() : undefined
            });

            if (status === 'completed') {
                const User = require('../models/User');
                await User.findByIdAndUpdate(req.user.id, { $inc: { points: 20 } });
            }
        }

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (err) {
        console.error('Error updating problem status:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

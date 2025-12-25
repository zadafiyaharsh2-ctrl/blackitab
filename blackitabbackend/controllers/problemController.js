/**
 * ============================================================================
 * PROBLEM CONTROLLER (problemController.js)
 * ============================================================================
 * 
 * This controller handles logic for the "Problem Sets" feature.
 * It manages:
 * 1. Problem Subjects (e.g. "Arrays", "Dynamic Programming")
 * 2. Problem Chapters (sub-categories)
 * 3. Problems themselves (the actual coding challenges)
 * 4. User Progress (tracking "attempted" vs "completed")
 */

const ProblemSubject = require('../models/ProblemSubject');
const ProblemChapter = require('../models/ProblemChapter');
const Problem = require('../models/Problem');
const ProblemProgress = require('../models/ProblemProgress');

/**
 * GET ALL PROBLEM SUBJECTS
 * Route: GET /api/problems/subjects
 * Access: Public
 * 
 * Returns the list of main categories for problems.
 * Sorted by creation time (Insertion order).
 */
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
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * CREATE PROBLEM SUBJECT
 * Route: POST /api/problems/subjects
 * Access: Private (Admin)
 * 
 * Creates a new subject category.
 * Note: Error 11000 is MongoDB's duplicate key error (if name already exists).
 */
exports.createProblemSubject = async (req, res) => {
    try {
        const subject = await ProblemSubject.create(req.body);

        res.status(201).json({
            success: true,
            data: subject
        });
    } catch (err) {
        console.error('Error creating problem subject:', err);
        // Handle duplicate name error
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Subject already exists' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * GET CHAPTERS BY SUBJECT
 * Route: GET /api/problems/subjects/:subjectId/chapters
 * Access: Public
 */
exports.getChaptersBySubject = async (req, res) => {
    try {
        const chapters = await ProblemChapter.find({
            subjectId: req.params.subjectId
        }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: chapters.length,
            data: chapters
        });
    } catch (err) {
        console.error('Error fetching problem chapters:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * GET PROBLEMS BY CHAPTER (With User Progress)
 * Route: GET /api/problems/chapters/:chapterId/problems
 * Access: Public (Optional Auth)
 * 
 * Logic:
 * 1. Fetch all problems for the chapter.
 * 2. If user is logged in (req.user exists), fetch their progress for these problems.
 * 3. Merge the status ('completed', 'attempted', or default 'not_attempted') into the response.
 */
exports.getProblemsByChapter = async (req, res) => {
    try {
        // 1. Fetch Problems
        const problems = await Problem.find({
            chapterId: req.params.chapterId
        }).sort({ order: 1 }); // Sort by defined order

        // Default: Assume user hasn't attempted anything
        let problemsWithStatus = problems.map(p => ({
            ...p.toObject(),
            status: 'not_attempted'
        }));

        // 2. Check User Progress (if logged in)
        if (req.user) {
            // Get IDs of all problems in this chapter
            const problemIds = problems.map(p => p._id);

            // Find progress records for this user and these problems
            const progress = await ProblemProgress.find({
                userId: req.user.id,
                problemId: { $in: problemIds }
            });

            // Create a quick lookup map: { problemId: 'status' }
            const progressMap = {};
            progress.forEach(p => {
                progressMap[p.problemId.toString()] = p.status;
            });

            // 3. Merge Status
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
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * GET SINGLE PROBLEM
 * Route: GET /api/problems/:id
 * Access: Public
 */
exports.getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }

        res.status(200).json({
            success: true,
            data: problem
        });
    } catch (err) {
        console.error('Error fetching problem:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * HELPER: Update User Streak and Points
 * Logic:
 * - Calculate if activity is consecutive (Streak + 1)
 * - Or if streak is broken (Streak reset to 1)
 * - Add points
 */
const updateUserStreakAndPoints = async (userId, pointsToAdd) => {
    const User = require('../models/User'); // Import here to avoid circular dependencies
    const user = await User.findById(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    let lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    if (!lastActive) {
        // First ever activity
        user.streak = 1;
        user.lastActiveDate = new Date();
    } else {
        const diffTime = Math.abs(today - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days difference

        if (diffDays === 1) {
            // Consecutive Day -> Increment Streak
            user.streak += 1;
            user.lastActiveDate = new Date();
        } else if (diffDays > 1) {
            // Missed a day -> Reset Streak
            user.streak = 1;
            user.lastActiveDate = new Date();
        } else {
            // Same day -> Update time but don't increment streak
            user.lastActiveDate = new Date();
        }
    }

    user.points = (user.points || 0) + pointsToAdd;
    await user.save();
};

/**
 * UPDATE PROBLEM STATUS
 * Route: POST /api/problems/:id/status
 * Access: Private (LoggedIn User)
 * 
 * Logic:
 * - Mark problem as 'completed' or 'attempted'
 * - Award points only on FIRST completion (20 points)
 */
exports.updateProblemStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'completed' or 'attempted'

        // Validation
        if (!['completed', 'attempted'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        // Check if progress record exists
        let progress = await ProblemProgress.findOne({
            userId: req.user.id,
            problemId: req.params.id
        });

        if (progress) {
            // Update existing record
            const wasCompleted = progress.status === 'completed';
            progress.status = status;
            progress.updatedAt = Date.now();

            // Check if this is a NEW completion
            if (status === 'completed' && !wasCompleted) {
                progress.completedAt = Date.now();
                // Award 20 Points
                await updateUserStreakAndPoints(req.user.id, 20);
            }
            await progress.save();

        } else {
            // Create new record
            progress = await ProblemProgress.create({
                userId: req.user.id,
                problemId: req.params.id,
                status,
                completedAt: status === 'completed' ? Date.now() : undefined
            });

            if (status === 'completed') {
                await updateUserStreakAndPoints(req.user.id, 20);
            }
        }

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (err) {
        console.error('Error updating problem status:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

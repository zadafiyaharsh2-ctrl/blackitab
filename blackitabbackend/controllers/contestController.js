const Contest = require('../models/Contest');
const ContestLeaderboard = require('../models/ContestLeaderboard');

// GET /api/contests — List all contests (paginated)
exports.listContests = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const filter = {};
        const now = new Date();

        if (status === 'active') {
            filter.startTime = { $lte: now };
            filter.endTime = { $gte: now };
            filter.isActive = true;
        } else if (status === 'upcoming') {
            filter.startTime = { $gt: now };
        } else if (status === 'past') {
            filter.endTime = { $lt: now };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [contests, total] = await Promise.all([
            Contest.find(filter).sort({ startTime: -1 }).skip(skip).limit(parseInt(limit)),
            Contest.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: contests,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/contests/upcoming — Next 5 upcoming contests
exports.getUpcomingContests = async (req, res) => {
    try {
        const now = new Date();
        const contests = await Contest.find({ startTime: { $gt: now } })
            .sort({ startTime: 1 })
            .limit(5);
        res.json({ success: true, data: contests });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/contests/:id
exports.getContestById = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
        res.json({ success: true, data: contest });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/contests/:id/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await ContestLeaderboard.find({ contestId: req.params.id })
            .populate('userId', 'name profileImage')
            .sort({ rank: 1 })
            .limit(100);
        res.json({ success: true, data: leaderboard });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/contests — Create a contest
exports.createContest = async (req, res) => {
    try {
        const { title, description, startTime, endTime, difficulty, questions } = req.body;

        if (!title || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: 'Title, start time, and end time are required' });
        }

        const contest = await Contest.create({
            title,
            description: description || '',
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            difficultyLevel: difficulty || 'Intermediate',
            questions: questions || [],
            isActive: true,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: contest });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/contests/:id
exports.updateContest = async (req, res) => {
    try {
        const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
        res.json({ success: true, data: contest });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/contests/:id
exports.deleteContest = async (req, res) => {
    try {
        const contest = await Contest.findByIdAndDelete(req.params.id);
        if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
        res.json({ success: true, message: 'Contest deleted' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

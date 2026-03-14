const User = require('../../models/User');
const Attempt = require('../../models/Attempt');
const Batch = require('../../models/Batch');
const BatchJoinRequest = require('../../models/BatchJoinRequest');
const Attendance = require('../../models/Attendance');
const ClassMaterial = require('../../models/ClassMaterial');

exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, isPrivate } = req.body;
        const userId = req.user._id;

        // Prepare update object
        const updateData = {};
        if (name) updateData.name = name;
        if (bio) updateData.bio = bio;
        if (isPrivate !== undefined) updateData.isPrivate = isPrivate === 'true' || isPrivate === true; // Handle string from FormData

        // If a file was uploaded, add its path to updateData
        if (req.file) {
            // Cloudinary returns the URL in req.file.path
            updateData.profileImage = req.file.path;
        }

        const user = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                isPrivate: user.isPrivate,
                profileImage: user.profileImage,
                followerCount: user.followerCount,
                followingCount: user.followingCount,
                subscriberCount: user.subscriberCount
            }
        });

    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.linkManager = async (req, res) => {
    try {
        const { managerId } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        const manager = await User.findById(managerId);

        if (!manager || !['hod', 'teacher'].includes(manager.role)) {
            return res.status(400).json({ success: false, message: 'Invalid manager' });
        }

        if (user.instituteId && manager.instituteId && user.instituteId.toString() !== manager.instituteId.toString()) {
            return res.status(400).json({ success: false, message: 'Must be in same institute' });
        }

        user.reportsToUser = manager._id;
        await user.save();

        res.json({ success: true, message: 'Supervisor linked successfully' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/user/leaderboard
 * 
 * Ranking algorithm: XP-weighted with streak bonus.
 * Score = points + (streak × 10)
 * This is similar to how LeetCode and HackerRank rank users:
 * primary sort by XP, tiebreaker by streak consistency.
 * 
 * Proper rank assignment handles ties:
 * - Same score = same rank (dense ranking)
 */
exports.getLeaderboard = async (req, res) => {
    try {
        // Fetch top 50 non-banned users with xp > 0
        const users = await User.find({ 
            isBanned: { $ne: true },
            xp: { $gt: 0 }
        })
        .select('name email xp points streak followerCount profileImage role')
        .sort({ xp: -1, streak: -1 })
        .limit(50)
        .lean();

        // Pluck IDs for aggregation
        const userIds = users.map(u => u._id);

        // Aggregate attempts for total study hours, problems solved, and accuracy
        const statsAggregation = await Attempt.aggregate([
            { $match: { userId: { $in: userIds } } },
            { 
                $group: { 
                    _id: "$userId",
                    totalAttempts: { $sum: 1 },
                    correctAttempts: { $sum: { $cond: [{ $eq: ["$isCorrect", true] }, 1, 0] } },
                    totalTimeSeconds: { $sum: { $ifNull: ["$timeTakenSeconds", 0] } },
                    uniqueCorrectQuestions: { 
                        $addToSet: { 
                            $cond: [{ $eq: ["$isCorrect", true] }, "$questionId", null] 
                        } 
                    }
                }
            }
        ]);

        // Create a map for O(1) lookups
        const statsMap = {};
        statsAggregation.forEach(stat => {
            // Remove null from set if present
            const solvedCount = stat.uniqueCorrectQuestions.filter(id => id !== null).length;
            const accuracy = stat.totalAttempts > 0 ? Math.round((stat.correctAttempts / stat.totalAttempts) * 1000) / 10 : 0;
            const studyHours = stat.totalTimeSeconds > 0 ? Math.round((stat.totalTimeSeconds / 3600) * 10) / 10 : 0;
            
            statsMap[stat._id.toString()] = {
                problemsSolved: solvedCount,
                accuracy: accuracy,
                studyHours: studyHours
            };
        });

        // Assign ranks with dense ranking and merge stats
        let currentRank = 0;
        let prevScore = -1;

        const ranked = users.map((user, index) => {
            const score = user.xp || 0;
            if (score !== prevScore) {
                currentRank = index + 1;
                prevScore = score;
            }
            const userStats = statsMap[user._id.toString()] || { problemsSolved: 0, accuracy: 0, studyHours: 0 };

            return {
                ...user,
                _id: user._id,
                rank: currentRank,
                score,
                stats: userStats
            };
        });

        res.json({ success: true, data: ranked });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.joinBatch = async (req, res) => {
    try {
        const { classCode } = req.body;
        if (!classCode) return res.status(400).json({ success: false, message: 'Class code is required' });

        const batch = await Batch.findOne({ classCode: classCode.toUpperCase() });
        if (!batch) return res.status(404).json({ success: false, message: 'Invalid class code. Please check and try again.' });

        // Check if student is already in the batch
        if (batch.studentIds.includes(req.user._id)) {
            return res.status(400).json({ success: false, message: 'You are already enrolled in this class' });
        }

        // Check if there is already a pending request
        const existingReq = await BatchJoinRequest.findOne({ studentId: req.user._id, batchId: batch._id, status: 'pending' });
        if (existingReq) return res.status(400).json({ success: false, message: 'Join request has already been sent and is pending approval' });

        // Use the first teacher assigned to the batch or null if not available
        const primaryTeacher = batch.teacherIds && batch.teacherIds.length > 0 ? batch.teacherIds[0] : null;

        await BatchJoinRequest.create({
            studentId: req.user._id,
            batchId: batch._id,
            teacherId: primaryTeacher
        });

        res.json({ success: true, message: 'Join request sent successfully to the teacher' });
    } catch (error) {
        console.error('Join Batch Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/user/batches
 * Returns all batches the authenticated student is enrolled in.
 */
exports.getMyBatches = async (req, res) => {
    try {
        const batches = await Batch.find({ studentIds: req.user._id })
            .populate('teacherIds', 'name email')
            .lean();
        res.json({ success: true, data: batches });
    } catch (error) {
        console.error('getMyBatches Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/user/batches/:batchId
 * Returns details of a single batch the student is enrolled in.
 */
exports.getMyBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        const studentId = req.user._id;

        const batch = await Batch.findOne({ _id: batchId, studentIds: studentId })
            .populate('teacherIds', 'name email profileImage')
            .lean();
        
        if (!batch) {
            return res.status(403).json({ success: false, message: 'You are not enrolled in this class or it does not exist' });
        }

        res.json({ success: true, data: batch });
    } catch (error) {
        console.error('getMyBatch Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/user/batches/:batchId/attendance
 * Returns the authenticated student's attendance for a specific batch.
 */
exports.getMyAttendanceForBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        const studentId = req.user._id;

        const batch = await Batch.findOne({ _id: batchId, studentIds: studentId });
        if (!batch) return res.status(403).json({ success: false, message: 'You are not enrolled in this class' });

        const records = await Attendance.find({ classId: batchId })
            .select('date records')
            .sort({ date: -1 })
            .lean();

        let present = 0, absent = 0, late = 0;
        const sessions = [];

        for (const rec of records) {
            const myEntry = rec.records.find(r => r.studentId?.toString() === studentId.toString());
            if (myEntry) {
                const status = myEntry.status;
                if (status === 'Present') present++;
                else if (status === 'Absent') absent++;
                else if (status === 'Late') late++;
                sessions.push({ date: rec.date, status });
            }
        }

        const total = present + absent + late;
        const attendancePercent = total > 0 ? Math.round((present / total) * 100) : null;

        res.json({
            success: true,
            data: { summary: { present, absent, late, total, attendancePercent }, sessions }
        });
    } catch (error) {
        console.error('getMyAttendanceForBatch Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/user/batches/:batchId/materials
 * Returns class materials for a batch the student is enrolled in.
 */
exports.getClassMaterials = async (req, res) => {
    try {
        const { batchId } = req.params;
        const studentId = req.user._id;

        const batch = await Batch.findOne({ _id: batchId, studentIds: studentId });
        if (!batch) return res.status(403).json({ success: false, message: 'You are not enrolled in this class' });

        const materials = await ClassMaterial.find({ batchId: batch._id })
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: materials });
    } catch (error) {
        console.error('getClassMaterials Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

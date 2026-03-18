const Institute = require('../../models/Institute');
const User = require('../../models/User');
const ExamQuestion = require('../../models/ExamQuestion');
const Post = require('../../models/Post');
const Attempt = require('../../models/Attempt');
const JoinRequest = require('../../models/JoinRequest');
const AssignmentSubmission = require('../../models/AssignmentSubmission');
const ExamResult = require('../../models/ExamResult');

// GET /api/institute/verify/:code
exports.verifyCode = async (req, res) => {
    try {
        const { code } = req.params;
        const institute = await Institute.findOne({ instituteCode: code.toUpperCase() });

        if (!institute) {
            return res.status(404).json({ success: false, message: 'Institute not found' });
        }

        res.json({
            success: true,
            data: {
                id: institute._id,
                name: institute.name,
                code: institute.instituteCode,
                departments: institute.departments || []
            }
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/institute/my
exports.getMyInstitute = async (req, res) => {
    try {
        if (!req.user.instituteId) {
            return res.status(400).json({ success: false, message: 'Not linked to an institute' });
        }
        const institute = await Institute.findById(req.user.instituteId);
        if (!institute) {
            return res.status(404).json({ success: false, message: 'Institute not found' });
        }

        const isPrivileged = ['institute', 'hod'].includes(req.user.role);
        const data = institute.toObject();
        if (!isPrivileged) {
            delete data.instituteCode;
        }

        res.json({ success: true, data });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/institute/profile
exports.updateInstituteProfile = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const { name, description, contactPhone, address, departments } = req.body;
        
        const institute = await Institute.findById(instId);
        if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

        if (name) institute.name = name;
        if (description !== undefined) institute.description = description;
        if (contactPhone !== undefined) institute.contactPhone = contactPhone;
        if (address !== undefined) institute.address = address;
        
        let parsedDepartments = departments;
        if (typeof departments === 'string') {
            try {
                parsedDepartments = JSON.parse(departments);
            } catch (e) {
                // Ignore parse error
            }
        }
        if (parsedDepartments && Array.isArray(parsedDepartments)) institute.departments = parsedDepartments;

        if (req.file) {
            const host = req.protocol + '://' + req.get('host');
            institute.bannerImage = `${host}/uploads/banners/${req.file.filename}`;
        } else if (req.body.bannerImage !== undefined) {
            institute.bannerImage = req.body.bannerImage;
        }

        await institute.save();
        res.json({ success: true, data: institute, message: 'Profile updated successfully' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// INSTITUTE STATS
// ══════════════════════════════════════════════════════════════

// GET /api/institute/stats
exports.getInstituteStats = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        // Fetch member IDs once beforehand to prevent blocking Promise.all concurrency
        const memberIds = await User.find({ instituteId: instId }).distinct('_id');

        const [members, questions, posts, attempts] = await Promise.all([
            User.countDocuments({ instituteId: instId }),
            ExamQuestion.countDocuments({ instituteId: instId }),
            Post.countDocuments({ user: { $in: memberIds } }),
            Attempt.countDocuments({ userId: { $in: memberIds } })
        ]);

        const institute = await Institute.findById(instId);
        const departmentsCount = institute?.departments?.length || 0;

        const roleCounts = await User.aggregate([
            { $match: { instituteId: instId } },
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        const roles = {};
        roleCounts.forEach(r => { roles[r._id] = r.count; });


        const pendingJoinRequests = await JoinRequest.countDocuments({ instituteId: instId, status: 'pending' });

        res.json({
            success: true,
            data: { members, questions, pendingJoinRequests, posts, attempts, departmentsCount, roleCounts: roles }
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/institute/departments/stats
exports.getDepartmentStats = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const institute = await Institute.findById(instId);
        if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

        const departments = institute.departments || [];

        // Aggregate student counts per department
        const stats = await User.aggregate([
            { $match: { instituteId: instId, role: 'student' } },
            { $unwind: '$departments' }, // Flatten the departments array
            { $match: { departments: { $in: departments } } }, // Only count valid departments
            { $group: { _id: '$departments', count: { $sum: 1 } } }
        ]);

        // Format into a map of { departmentName: count }
        const countsMap = {};
        departments.forEach(dept => { countsMap[dept] = 0; }); // Initialize all to 0
        stats.forEach(stat => { countsMap[stat._id] = stat.count; });

        res.json({
            success: true,
            data: countsMap
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// MEMBER MANAGEMENT
// ══════════════════════════════════════════════════════════════

// GET /api/institute/members
exports.getMembers = async (req, res) => {
    try {
        if (!req.user.instituteId) {
            return res.status(400).json({ success: false, message: 'Not linked to an institute' });
        }
        const members = await User.find({ instituteId: req.user.instituteId })
            .select('-password')
            .sort({ role: 1, name: 1 });
        res.json({ success: true, data: members });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

    // POST /api/institute/members — Add/create member to institute
    exports.addMember = async (req, res) => {
        try {
            const instId = req.user.instituteId;
            if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

            const { name, email, role, batchYear, departments } = req.body;
            let { password } = req.body;
            if (!name || !email) {
                return res.status(400).json({ success: false, message: 'Name and email are required' });
            }

            // Assign a default password if not provided
            if (!password) {
                password = '123456';
            }

        // Fetch Institute to get the code
        const Institute = require('../../models/Institute');
        const institute = await Institute.findById(instId);
        if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

        // Check existing user
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            // If they exist but have no institute, link them
            if (!existing.instituteId) {
                existing.instituteId = instId;
                existing.instituteCode = institute.instituteCode;
                if (role && ['student', 'teacher', 'hod'].includes(role)) existing.role = role;
                await existing.save();
                return res.json({ success: true, message: `Existing user "${existing.name}" linked to your institute` });
            }
            return res.status(400).json({ success: false, message: 'User already belongs to an institute' });
        }

        const validRoles = ['student', 'teacher', 'hod'];
        const assignedRole = validRoles.includes(role) ? role : 'student';

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: assignedRole,
            instituteId: instId,
            instituteCode: institute.instituteCode,
            batchYear: batchYear || '',
            departments: Array.isArray(departments) ? departments : []
        });
        await newUser.save();

        res.status(201).json({ success: true, message: `User "${name}" created as ${assignedRole} in your institute` });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/institute/members/:id/role
exports.changeMemberRole = async (req, res) => {
    try {
        const { role, batchYear } = req.body;
        const validRoles = ['student', 'teacher', 'hod'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: `Invalid role. Must be: ${validRoles.join(', ')}` });
        }

        // Ensure target user is in same institute
        const targetUser = await User.findById(req.params.id);
        if (!targetUser || !targetUser.instituteId || targetUser.instituteId.toString() !== req.user.instituteId.toString()) {
            return res.status(400).json({ success: false, message: 'User not in your institute' });
        }

        const updates = {};
        if (role) {
            targetUser.role = role;
            updates.role = role;
        }

        if (req.body.departments && Array.isArray(req.body.departments)) {
            targetUser.departments = req.body.departments;
            updates.departments = req.body.departments;
        }

        if (batchYear !== undefined) {
            targetUser.batchYear = batchYear;
            updates.batchYear = batchYear;
        }

        await targetUser.save();

        res.json({ success: true, message: `Member updated`, data: updates });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/institute/members/:id/ban — Ban/unban member
exports.toggleBanMember = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const target = await User.findById(req.params.id);
        if (!target || !target.instituteId || target.instituteId.toString() !== instId.toString()) {
            return res.status(400).json({ success: false, message: 'User not in your institute' });
        }
        target.isBanned = !target.isBanned;
        await target.save();
        res.json({ success: true, message: target.isBanned ? 'Member banned' : 'Member unbanned', data: { isBanned: target.isBanned } });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/institute/members/:id — Remove member from institute
exports.removeMember = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const target = await User.findById(req.params.id);
        if (!target || !target.instituteId || target.instituteId.toString() !== instId.toString()) {
            return res.status(400).json({ success: false, message: 'User not in your institute' });
        }
        // Don't delete the user — just unlink from institute
        target.instituteId = null;
        target.role = 'student';
        await target.save();
        res.json({ success: true, message: `Member "${target.name}" removed from institute` });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// QUESTION MANAGEMENT
// ══════════════════════════════════════════════════════════════
// const GeneratedQuestion = require('../../models/GeneratedQuestion'); // Removed

// GET /api/institute/questions — List questions created by institute teachers
exports.listInstituteQuestions = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        let filter = { instituteId: instId, status: 'Published', isActive: true };
        if (req.user.role === 'hod') {
            if (req.user.departmentId) {
                filter.departmentId = req.user.departmentId;
            } else if (req.user.departments && req.user.departments.length > 0) {
                const mongoose = require('mongoose');
                const validDeptIds = req.user.departments.filter(d => mongoose.Types.ObjectId.isValid(d));
                if (validDeptIds.length > 0) {
                    filter.departmentId = { $in: validDeptIds };
                }
            }
        }

        const questions = await ExamQuestion.find(filter)
            .populate('createdBy', 'name email role departments')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ success: true, data: questions });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/institute/questions/:id
exports.updateInstituteQuestion = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const question = await ExamQuestion.findById(req.params.id);
        
        if (!question || !question.instituteId || question.instituteId?.toString() !== instId?.toString() || question.status !== 'Published') {
            console.log('404 Debug:', {
                questionExists: !!question,
                questionInstId: question?.instituteId?.toString(),
                userInstId: instId?.toString(),
                questionStatus: question?.status,
                userRole: req.user.role
            });
            return res.status(404).json({ success: false, message: 'Published question not found in your institute' });
        }
        
        if (req.user.role === 'hod') {
            const hasDeptId = req.user.departmentId && question.departmentId && req.user.departmentId.toString() === question.departmentId.toString();
            const hasDeptsStr = question.departmentId && req.user.departments && req.user.departments.some(d => d.toString() === question.departmentId.toString());
            
            if (!hasDeptId && !hasDeptsStr) {
                return res.status(403).json({ success: false, message: 'Question does not belong to your department(s)' });
            }
        }
        const allowedUpdates = ['question', 'options', 'correctAnswer', 'explanation', 'subject', 'difficulty', 'topicId', 'approvalStatus'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                question[field] = req.body[field];
            }
        });

        if (question.createdBy?.toString() !== req.user._id.toString()) {
            question.isModerated = true;
        }

        await question.save();

        res.json({ success: true, message: 'Question updated successfully', data: question });
    } catch (error) {
        console.error('Update Institute Question Error:', error);
        require('fs').writeFileSync('c:/Users/Deepesh/Desktop/blackitab/blackitabbackend/error.log', error.stack || error.toString());
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/institute/questions/:id
exports.deleteInstituteQuestion = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const question = await ExamQuestion.findById(req.params.id);
        if (!question || !question.instituteId || question.instituteId?.toString() !== instId?.toString()) {
            return res.status(404).json({ success: false, message: 'Question not found in your institute' });
        }

        if (req.user.role === 'hod') {
            const hasDeptId = req.user.departmentId && question.departmentId && req.user.departmentId.toString() === question.departmentId.toString();
            const hasDeptsStr = question.departmentId && req.user.departments && req.user.departments.some(d => d.toString() === question.departmentId.toString());
            
            if (!hasDeptId && !hasDeptsStr) {
                return res.status(403).json({ success: false, message: 'Question does not belong to your department(s)' });
            }
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

// ══════════════════════════════════════════════════════════════
// THEORY MANAGEMENT
// ══════════════════════════════════════════════════════════════
const Theory = require('../../models/Theory');

exports.listInstituteTheory = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const theories = await Theory.find({ instituteId: instId })
            .populate('uploadedBy', 'name email role')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: theories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addTheory = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const { title, content, fileUrl, subject, department } = req.body;
        if (!title || !subject) {
            return res.status(400).json({ success: false, message: 'Title and Subject are required' });
        }

        const newTheory = new Theory({
            title,
            content: content || '',
            fileUrl: fileUrl || '',
            subject,
            department: department || '',
            uploadedBy: req.user._id,
            instituteId: instId
        });

        await newTheory.save();
        res.status(201).json({ success: true, data: newTheory, message: 'Theory uploaded successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateTheory = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const theory = await Theory.findById(req.params.id);
        
        if (!theory || !theory.instituteId || theory.instituteId.toString() !== instId.toString()) {
            return res.status(404).json({ success: false, message: 'Theory not found in your institute' });
        }

        const { title, content, fileUrl, subject, department } = req.body;
        if (title) theory.title = title;
        if (content !== undefined) theory.content = content;
        if (fileUrl !== undefined) theory.fileUrl = fileUrl;
        if (subject) theory.subject = subject;
        if (department !== undefined) theory.department = department;

        await theory.save();
        res.json({ success: true, message: 'Theory updated', data: theory });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteTheory = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const theory = await Theory.findById(req.params.id);
        
        if (!theory || !theory.instituteId || theory.instituteId.toString() !== instId.toString()) {
            return res.status(404).json({ success: false, message: 'Theory not found in your institute' });
        }

        await Theory.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Theory deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// POST MODERATION
// ══════════════════════════════════════════════════════════════

// GET /api/institute/posts — List posts by institute members
exports.listInstitutePosts = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const memberIds = await User.find({ instituteId: instId }).distinct('_id');
        const posts = await Post.find({ user: { $in: memberIds } })
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ success: true, data: posts });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/institute/posts/:id
exports.deleteInstitutePost = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const memberIds = await User.find({ instituteId: instId }).distinct('_id');
        const post = await Post.findById(req.params.id);
        if (!post || !memberIds.some(id => id.equals(post.user))) {
            return res.status(404).json({ success: false, message: 'Post not found in your institute' });
        }
        await Post.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════════

// GET /api/institute/analytics — Institute-level analytics
exports.getInstituteAnalytics = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const members = await User.find({ instituteId: instId }).select('_id name email role points xp streak').lean();
        const memberIds = members.map(m => m._id);

        // Leaderboard — top students by points
        const leaderboard = members
            .filter(m => m.role === 'student')
            .sort((a, b) => (b.points || 0) - (a.points || 0))
            .slice(0, 20);

        // Aggregate attempt stats
        const attemptStats = await Attempt.aggregate([
            { $match: { userId: { $in: memberIds } } },
            { $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } },
                avgTime: { $avg: '$timeTakenSeconds' }
            }}
        ]);

        const stats = attemptStats[0] || { totalAttempts: 0, correctAttempts: 0, avgTime: 0 };
        const accuracy = stats.totalAttempts > 0 ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100) : 0;

        // Subject-wise accuracy
        const subjectStats = await Attempt.aggregate([
            { $match: { userId: { $in: memberIds } } },
            { $lookup: { from: 'examquestions', localField: 'questionId', foreignField: '_id', as: 'question' } },
            { $unwind: '$question' },
            { $group: {
                _id: '$question.subject',
                total: { $sum: 1 },
                correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
            }},
            { $project: {
                subject: '$_id',
                total: 1,
                correct: 1,
                accuracy: { $multiply: [{ $divide: ['$correct', '$total'] }, 100] }
            }},
            { $sort: { total: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                leaderboard,
                totalAttempts: stats.totalAttempts,
                accuracy,
                avgTimeSeconds: Math.round(stats.avgTime || 0),
                subjectStats
            }
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// TEACHER FEEDBACK & MONITORING
// ══════════════════════════════════════════════════════════════

// GET /api/institute/teachers — List teachers with avg ratings
exports.listTeachersWithRatings = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const teachers = await User.find({ instituteId: instId, role: { $in: ['teacher', 'hod'] } })
            .select('name email role');

        const TeacherFeedback = require('../../models/TeacherFeedback');

        // Aggregate ratings
        const ratings = await TeacherFeedback.aggregate([
            { $match: { instituteId: instId } },
            { $group: {
                _id: '$teacherId',
                avgRating: { $avg: '$rating' },
                feedbackCount: { $sum: 1 }
            }}
        ]);

        const ratingsMap = {};
        ratings.forEach(r => { ratingsMap[r._id.toString()] = r });

        const data = teachers.map(t => {
            const r = ratingsMap[t._id.toString()] || { avgRating: 0, feedbackCount: 0 };
            return {
                _id: t._id,
                name: t.name,
                email: t.email,
                role: t.role,
                avgRating: r.avgRating > 0 ? Number(r.avgRating.toFixed(1)) : 0,
                feedbackCount: r.feedbackCount,
                isFlagged: r.feedbackCount > 3 && r.avgRating < 2.5 // Flag if consistently rated poorly
            };
        });

        res.json({ success: true, data });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/institute/teachers/:id/feedback — Detailed feedback for a teacher
exports.getTeacherFeedback = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const targetTeacher = await User.findOne({ _id: req.params.id, instituteId: instId });

        if (!targetTeacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found in your institute' });
        }

        const TeacherFeedback = require('../../models/TeacherFeedback');

        const feedback = await TeacherFeedback.find({ teacherId: targetTeacher._id })
            .populate('studentId', 'name')
            .populate('questionId', 'subject question')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, data: feedback });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/institute/feedback — Submit feedback on a teacher question
exports.submitFeedback = async (req, res) => {
    try {
        const { teacherId, questionId, rating, comment, feedbackType } = req.body;
        const studentId = req.user._id;
        const instId = req.user.instituteId;

        if (!teacherId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Invalid rating data' });
        }

        const TeacherFeedback = require('../../models/TeacherFeedback');

        // Check if feedback already provided for this combo
        const query = { studentId, teacherId };
        if (questionId) query.questionId = questionId;

        const existing = await TeacherFeedback.findOne(query);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Feedback already submitted for this item' });
        }

        const feedback = new TeacherFeedback({
            teacherId,
            studentId,
            questionId: questionId || null,
            instituteId: instId,
            rating,
            comment: comment || '',
            feedbackType: feedbackType || 'quiz_end'
        });

        await feedback.save();
        res.status(201).json({ success: true, message: 'Feedback submitted successfully' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// JOIN INSTITUTE
// ══════════════════════════════════════════════════════════════

// POST /api/institute/join — Student joins an institute by code (Creates a Request)
exports.joinInstitute = async (req, res) => {
    try {
        const { instituteCode, batchYear, departments } = req.body;
        if (!instituteCode) {
            return res.status(400).json({ success: false, message: 'Institute code is required' });
        }
        
        if (!departments) {
            return res.status(400).json({ success: false, message: 'Departments/Division is required to join an institute.' });
        }
        if (req.user.role === 'student' && !batchYear) {
            return res.status(400).json({ success: false, message: 'Batch Year is required for students joining an institute.' });
        }

        // Check if user already belongs to an institute
        if (req.user.instituteId) {
            return res.status(400).json({ success: false, message: 'You already belong to an institute. Leave your current institute first.' });
        }

        const institute = await Institute.findOne({ instituteCode: instituteCode.toUpperCase() });
        if (!institute) {
            return res.status(404).json({ success: false, message: 'Invalid institute code. No institute found.' });
        }

        // Check for existing pending request
        const existingRequest = await JoinRequest.findOne({
            userId: req.user._id,
            instituteId: institute._id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ success: false, message: 'You already have a pending join request for this institute.' });
        }

        // Create a new Join Request
        const joinRequest = new JoinRequest({
            userId: req.user._id,
            instituteId: institute._id,
            status: 'pending'
        });

        await joinRequest.save();

        // Update the user's batchYear and departments eagerly
        // Note: departments comes from frontend as comma separated string or array. Let's make sure it's an array.
        let deptsArray = [];
        if (Array.isArray(departments)) deptsArray = departments;
        else if (typeof departments === 'string') deptsArray = departments.split(',').map(d => d.trim()).filter(d => d);

        await User.findByIdAndUpdate(req.user._id, {
            batchYear: batchYear,
            departments: deptsArray
        });

        await joinRequest.save();

        res.json({
            success: true,
            message: `Join request sent to "${institute.name}". Please wait for admin approval.`,
            institute: { _id: institute._id, name: institute.name, instituteCode: institute.instituteCode }
        });
    } catch (error) {
        // Handle unique constraint error if multiple rapid requests
        if (error.code === 11000) {
           return res.status(400).json({ success: false, message: 'You already have a pending join request.' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/institute/join-requests — Get pending join requests for the institute
exports.getJoinRequests = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const requests = await JoinRequest.find({ instituteId: instId, status: 'pending' })
            .populate('userId', 'name email batchYear role')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/institute/join-requests/:id/approve — Approve a join request
exports.approveJoinRequest = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const requestId = req.params.id;

        const joinRequest = await JoinRequest.findOne({ _id: requestId, instituteId: instId, status: 'pending' });
        if (!joinRequest) {
            return res.status(404).json({ success: false, message: 'Pending request not found' });
        }

        const user = await User.findById(joinRequest.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if user already joined another institute while pending
        if (user.instituteId) {
            joinRequest.status = 'rejected'; // Auto-reject since they joined somewhere else
            await joinRequest.save();
            return res.status(400).json({ success: false, message: 'User has already joined another institute.' });
        }

        const institute = await Institute.findById(instId);

        // Update User
        user.instituteId = institute._id;
        user.instituteCode = institute.instituteCode;
        if (user.role !== 'student' && user.role !== 'teacher' && user.role !== 'hod') {
            user.role = 'student';
        }
        await user.save();

        // Update Request Status
        joinRequest.status = 'approved';
        await joinRequest.save();

        res.json({ success: true, message: `User "${user.name}" approved and added to institute.` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/institute/join-requests/:id/reject — Reject a join request
exports.rejectJoinRequest = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const requestId = req.params.id;

        const joinRequest = await JoinRequest.findOne({ _id: requestId, instituteId: instId, status: 'pending' });
        if (!joinRequest) {
            return res.status(404).json({ success: false, message: 'Pending request not found' });
        }

        // Update Request Status
        joinRequest.status = 'rejected';
        await joinRequest.save();

        const user = await User.findById(joinRequest.userId).select('name');
        
        res.json({ success: true, message: `Join request for "${user ? user.name : 'Unknown User'}" rejected.` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// CLASS MATERIALS MANAGEMENT (Institute-level)
// ══════════════════════════════════════════════════════════════
const ClassMaterial = require('../../models/ClassMaterial');
const Batch = require('../../models/Batch');

// GET /api/institute/materials — list all materials across all batches in the institute
exports.getInstituteMaterials = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const materials = await ClassMaterial.find({ instituteId: instId })
            .populate('teacherId', 'name email')
            .populate('batchId', 'name year section')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: materials });
    } catch (error) {
        console.error('Get Institute Materials Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/institute/batch/:batchId/materials — create material for any batch in institute
exports.createInstituteMaterial = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const batch = await Batch.findOne({ _id: req.params.batchId, instituteId: instId });
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found in your institute' });

        const { title, description, content, links, files } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

        const material = await ClassMaterial.create({
            title,
            description: description || '',
            content: content || '',
            links: Array.isArray(links) ? links : [],
            files: Array.isArray(files) ? files : [],
            batchId: batch._id,
            teacherId: req.user._id,
            instituteId: instId
        });

        res.status(201).json({ success: true, data: material });
    } catch (error) {
        console.error('Create Institute Material Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/institute/material/:id — update any material in the institute
exports.updateInstituteMaterial = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const material = await ClassMaterial.findById(req.params.id);
        if (!material || !material.instituteId || material.instituteId.toString() !== instId.toString()) {
            return res.status(404).json({ success: false, message: 'Material not found in your institute' });
        }

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
        console.error('Update Institute Material Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/institute/material/:id — delete any material in the institute
exports.deleteInstituteMaterial = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const material = await ClassMaterial.findById(req.params.id);
        if (!material || !material.instituteId || material.instituteId.toString() !== instId.toString()) {
            return res.status(404).json({ success: false, message: 'Material not found in your institute' });
        }


        await ClassMaterial.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Material deleted' });
    } catch (error) {
        console.error('Delete Institute Material Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/institute/student/:id/detail — Full student profile for institute view
exports.getStudentDetail = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const student = await User.findOne({ _id: req.params.id, instituteId: instId }).select('-password');
        if (!student) return res.status(404).json({ success: false, message: 'Student not found in your institute' });

        const [attemptCount, correctCount, submissions, examResults] = await Promise.all([
            Attempt.countDocuments({ userId: student._id }),
            Attempt.countDocuments({ userId: student._id, isCorrect: true }),
            AssignmentSubmission.find({ studentId: student._id })
                .populate({ path: 'assignmentId', select: 'title totalMarks' })
                .sort({ submittedAt: -1 })
                .limit(20),
            ExamResult.find({ studentId: student._id })
                .populate({ path: 'examId', select: 'title totalMarks scheduledAt' })
                .sort({ submittedAt: -1 })
                .limit(20)
        ]);

        const accuracy = attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : 0;

        res.json({
            success: true,
            data: { student, attemptCount, correctCount, accuracy, submissions, examResults }
        });
    } catch (error) {
        console.error('Get Student Detail Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

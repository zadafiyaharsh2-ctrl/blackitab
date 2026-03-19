const Subject = require('../../models/Subject');
const Topic = require('../../models/Topic');
const FullTopicData = require('../../models/FullTopicData');
const Theory = require('../../models/Theory');
const TeacherContent = require('../../models/TeacherContent');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

// Helper to manually extract user from token (since these routes are primarily public)
const getUserFromToken = async (req) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) return null;
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        return user;
    } catch (error) {
        return null;
    }
};

// GET /api/subjects — all subjects with topic counts
exports.getSubjects = async (req, res) => {
    try {
        // 1. Fetch global subjects
        const subjects = await Subject.find().sort({ name: 1 });
        const subjectsWithCounts = await Promise.all(subjects.map(async (subject) => {
            const count = await Topic.countDocuments({ subjectId: subject._id });
            return { ...subject.toObject(), topicCount: count };
        }));

        // 2. Aggregate Virtual Subjects if user is from an institute
        const user = await getUserFromToken(req);
        if (user && user.instituteId) {
            // Virtual Subject for Institute Theory
            const theoryCount = await Theory.countDocuments({ instituteId: user.instituteId });
            if (theoryCount > 0) {
                subjectsWithCounts.push({
                    _id: 'virtual_institute_theory',
                    name: 'Institute Materials',
                    description: 'Study materials uploaded by your institute administration',
                    topicCount: theoryCount,
                    isVirtual: true
                });
            }

            // Virtual Subject for Teacher Content
            const teacherContentCount = await TeacherContent.countDocuments({ 
                instituteId: user.instituteId,
                visibility: { $ne: 'private' }
            });
            if (teacherContentCount > 0) {
                subjectsWithCounts.push({
                    _id: 'virtual_teacher_content',
                    name: 'Teacher Notes',
                    description: 'Notes and resources shared by your teachers',
                    topicCount: teacherContentCount,
                    isVirtual: true
                });
            }
        }

        res.json({ success: true, data: subjectsWithCounts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/subjects/:subjectId/topics — topics for a subject (sorted by insertion order)
exports.getTopicsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;

        // Virtual Subject Intercept: Institute Theory
        if (subjectId === 'virtual_institute_theory') {
            const user = await getUserFromToken(req);
            if (!user || !user.instituteId) return res.status(403).json({ success: false, message: 'Unauthorized' });

            const theories = await Theory.find({ instituteId: user.instituteId }).sort({ createdAt: -1 });
            const virtualTopics = theories.map(t => ({
                _id: 'inst_theory_' + t._id.toString(),
                name: t.title,
                subjectId: 'virtual_institute_theory',
                createdAt: t.createdAt
            }));
            return res.json({ success: true, data: virtualTopics });
        }

        // Virtual Subject Intercept: Teacher Content
        if (subjectId === 'virtual_teacher_content') {
            const user = await getUserFromToken(req);
            if (!user || !user.instituteId) return res.status(403).json({ success: false, message: 'Unauthorized' });

            const contents = await TeacherContent.find({ 
                instituteId: user.instituteId,
                visibility: { $ne: 'private' } 
            }).sort({ createdAt: -1 });

            const virtualTopics = contents.map(c => ({
                _id: 'teacher_cont_' + c._id.toString(),
                name: c.title,
                subjectId: 'virtual_teacher_content',
                createdAt: c.createdAt
            }));
            return res.json({ success: true, data: virtualTopics });
        }

        // Default behavior for global subjects
        const topics = await Topic.find({ subjectId }).sort({ createdAt: 1 });
        res.json({ success: true, data: topics });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/topics/:id/full — full content for a topic (from FullTopicData collection)
exports.getTopicFullContent = async (req, res) => {
    try {
        const { id } = req.params;

        // Virtual Topic Intercept: Institute Theory
        if (id.startsWith('inst_theory_')) {
            const realId = id.replace('inst_theory_', '');
            const theory = await Theory.findById(realId);
            if (!theory) return res.status(404).json({ success: false, message: 'Not found' });

            const virtualFullData = {
                topicId: id,
                content: [
                    { type: 'paragraph', text: theory.content }
                ]
            };
            
            // Add download link if available
            if (theory.fileUrl) {
                virtualFullData.content.push({ 
                    type: 'link', 
                    text: 'View attached resource document', 
                    url: theory.fileUrl 
                });
            }

            return res.json({ success: true, data: virtualFullData });
        }

        // Virtual Topic Intercept: Teacher Content
        if (id.startsWith('teacher_cont_')) {
            const realId = id.replace('teacher_cont_', '');
            const tc = await TeacherContent.findById(realId);
            if (!tc) return res.status(404).json({ success: false, message: 'Not found' });

            const virtualFullData = {
                topicId: id,
                content: [
                    { type: 'paragraph', text: tc.content }
                ]
            };

            // Prepend description if available
            if (tc.description) {
                virtualFullData.content.unshift({ type: 'paragraph', text: tc.description });
            }

            return res.json({ success: true, data: virtualFullData });
        }

        // Default behavior for global topics
        const topicData = await FullTopicData.findOne({ topicId: id });

        if (!topicData) {
            return res.status(404).json({ success: false, message: 'Content not found for this topic' });
        }

        res.json({ success: true, data: topicData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

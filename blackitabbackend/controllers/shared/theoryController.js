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

// GET /api/theory/search
exports.searchTheory = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.json({ success: true, data: [] });

        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const terms = q.split(/\s+/).filter(t => t.length > 0).map(t => new RegExp(escapeRegExp(t), 'i'));

        if (terms.length === 0) return res.json({ success: true, data: [] });

        const results = [];

        // 1. Search Subjects (match ALL terms in either name or description)
        const subjectQuery = {
            $and: terms.map(term => ({
                $or: [{ name: term }, { description: term }]
            }))
        };
        const subjects = await Subject.find(subjectQuery).limit(5).lean();

        for (const s of subjects) {
            results.push({
                _id: 'sub_' + s._id,
                type: 'subject',
                subjectId: s._id,
                subjectName: s.name,
                name: s.name,
                description: s.description || 'Subject Match',
            });
        }

        // 2. Search Topics (match ALL terms in topic name)
        const topicQuery = {
            $and: terms.map(term => ({ name: term }))
        };
        const topics = await Topic.find(topicQuery).limit(5).lean();
        
        const subjectIds = [...new Set(topics.map(t => t.subjectId))];
        const topicsSubjects = await Subject.find({ _id: { $in: subjectIds } }).lean();
        const subMap = {};
        topicsSubjects.forEach(s => subMap[s._id.toString()] = s.name);

        for (const t of topics) {
            results.push({
                _id: 'top_' + t._id,
                type: 'topic',
                subjectId: t.subjectId,
                topicId: t._id,
                subjectName: subMap[t.subjectId?.toString()] || 'Unknown Subject',
                name: t.name,
                description: 'Topic heading match',
                matchWord: q
            });
        }

        // 3. Search FullTopicData (match ALL terms deeply within content.text)
        const fullDataQuery = {
            $and: terms.map(term => ({ "content.text": term }))
        };
        const fullData = await FullTopicData.find(fullDataQuery).limit(8).lean();

        for (const fd of fullData) {
            // Find a block that matches at least the first term for the snippet
            let snippet = '';
            for (const block of fd.content) {
                if (block.text && terms[0].test(block.text)) {
                    // Quick and dirty snippet around the first matched term
                    const matchStr = q.split(/\s+/)[0]; 
                    const matchIndex = block.text.toLowerCase().indexOf(matchStr.toLowerCase());
                    if (matchIndex !== -1) {
                        const start = Math.max(0, matchIndex - 35);
                        const end = Math.min(block.text.length, matchIndex + matchStr.length + 35);
                        snippet = (start > 0 ? '...' : '') + block.text.substring(start, end) + (end < block.text.length ? '...' : '');
                        break;
                    }
                }
            }

            const parentTopic = await Topic.findById(fd.topicId).lean();
            let subName = 'Unknown Subject';
            let subId = null;
            if (parentTopic) {
                subId = parentTopic.subjectId;
                subName = subMap[subId?.toString()] || (await Subject.findById(subId).lean())?.name || 'Unknown Subject';
            }

            results.push({
                _id: 'deep_' + fd._id,
                type: 'content',
                subjectId: subId,
                topicId: fd.topicId,
                subjectName: subName,
                name: fd.title || parentTopic?.name || 'Deep Content Match',
                description: snippet || 'Matched inside topic content',
                matchWord: q
            });
        }

        // Return up to 15 best matches
        res.json({ success: true, data: results.slice(0, 15) });
    } catch (error) {
        console.error("Theory Search Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

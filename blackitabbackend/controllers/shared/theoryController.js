const Subject = require('../../models/Subject');
const Topic = require('../../models/Topic');
const FullTopicData = require('../../models/FullTopicData');

// GET /api/subjects — all subjects with topic counts
exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ name: 1 });

        const subjectsWithCounts = await Promise.all(subjects.map(async (subject) => {
            const count = await Topic.countDocuments({ subjectId: subject._id });
            return { ...subject.toObject(), topicCount: count };
        }));

        res.json({ success: true, data: subjectsWithCounts });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/subjects/:subjectId/topics — topics for a subject (sorted by insertion order)
exports.getTopicsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
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
        const topicData = await FullTopicData.findOne({ topicId: id });

        if (!topicData) {
            return res.status(404).json({ success: false, message: 'Content not found for this topic' });
        }

        res.json({ success: true, data: topicData });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const Attempt = require('../models/Attempt');
const ExamQuestion = require('../models/ExamQuestion');
const User = require('../models/User');

// POST /api/attempts/submit
exports.submitAttempt = async (req, res) => {
    try {
        const { questionId, selectedOption, timeTakenSeconds } = req.body;
        const userId = req.user._id;

        const question = await ExamQuestion.findById(questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const isCorrect = (question.correctAnswer === selectedOption);

        // 1. Create Attempt Record
        const attempt = new Attempt({
            userId,
            questionId,
            selectedOption,
            isCorrect,
            timeTakenSeconds: timeTakenSeconds || 0
        });
        await attempt.save();

        // 2. Update Question Global Stats (Atomic Updates for Scale)
        const timeInc = timeTakenSeconds ? timeTakenSeconds : 0;
        await ExamQuestion.findByIdAndUpdate(questionId, {
            $inc: {
                totalAttempts: 1,
                successfulAttempts: isCorrect ? 1 : 0
            }
        });

        // 5. Update User Gamification — Difficulty-weighted Points & 10 XP per correct question
        //    Easy=5, Medium=15, Hard=30 (industry-standard weighted scoring)
        if (isCorrect) {
            const XP_BY_DIFFICULTY = { 'Easy': 5, 'Medium': 15, 'Hard': 30 };
            const pointsGain = XP_BY_DIFFICULTY[question.difficulty] || 10;
            await User.findByIdAndUpdate(userId, {
                $inc: { points: pointsGain, xp: 10 }
            });
        }

        res.json({
            success: true,
            isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
        });

    } catch (error) {
        console.error('Submit attempt error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/attempts/analytics
exports.getDashboardAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        // Fetch all attempts for accuracy and stats
        const allAttempts = await Attempt.find({ userId }).populate('questionId').sort({ attemptedAt: -1 }).lean();
        
        const totalAttempts = allAttempts.length;
        const correctAttempts = allAttempts.filter(a => a.isCorrect);
        
        // Calculate unique problems solved
        const uniqueSolvedIds = new Set(correctAttempts.map(a => a.questionId?._id?.toString()));
        const problemsSolved = uniqueSolvedIds.size;
        
        const accuracy = totalAttempts > 0 ? (correctAttempts.length / totalAttempts) * 100 : 0;
        const studyHours = allAttempts.reduce((acc, curr) => acc + (curr.timeTakenSeconds || 0), 0) / 3600;

        const stats = {
            problemsSolved,
            problemsChange: 0,
            accuracy: Math.round(accuracy * 10) / 10,
            accuracyChange: 0,
            currentStreak: user.streak || 0,
            streakChange: 0,
            studyHours: Math.round(studyHours * 10) / 10,
            hoursChange: 0
        };

        // Extract weak/strong subjects based on tags
        const tagPerformance = {};
        allAttempts.forEach(a => {
            if (!a.questionId || !a.questionId.tags) return;
            a.questionId.tags.forEach(tag => {
                if (!tagPerformance[tag]) tagPerformance[tag] = { total: 0, correct: 0 };
                tagPerformance[tag].total++;
                if (a.isCorrect) tagPerformance[tag].correct++;
            });
        });

        const subjectScores = Object.keys(tagPerformance).map(tag => {
            const perf = tagPerformance[tag];
            const prog = Math.round((perf.correct / perf.total) * 100);
            return {
                name: tag,
                progress: prog,
                mastery: prog >= 80 ? 'Advanced' : prog >= 50 ? 'Intermediate' : 'Beginner',
                color: prog >= 80 ? 'from-purple-500 to-indigo-600' : prog >= 50 ? 'from-blue-500 to-cyan-600' : 'from-pink-500 to-rose-600'
            };
        }).sort((a, b) => b.progress - a.progress) || [];

        const subjectProgress = subjectScores.slice(0, 6);
        
        const strengths = subjectScores.filter(s => s.progress >= 75).map(s => s.name).slice(0, 5);
        const weaknesses = subjectScores.filter(s => s.progress < 50).map(s => s.name).slice(0, 5);

        // Recent activity
        const recentActivity = allAttempts.slice(0, 5).map(a => ({
            type: a.isCorrect ? 'completed' : 'attempted',
            title: a.questionId?.content?.substring(0, 30) + '...' || 'Unknown Question',
            time: new Date(a.attemptedAt).toLocaleDateString(),
            difficulty: a.questionId?.difficulty || 'Medium'
        }));

        res.json({
            success: true,
            data: {
                stats,
                subjectProgress: subjectProgress.length > 0 ? subjectProgress : [
                   { name: 'Onboarding', progress: 10, color: 'from-blue-500 to-cyan-600', mastery: 'Beginner' }
                ],
                strengths: strengths.length > 0 ? strengths : ['Getting Started'],
                weaknesses: weaknesses.length > 0 ? weaknesses : ['Practice needed'],
                recentActivity,
            }
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

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
        const user = await User.findById(userId);
        let newStreak = user.streak || 0;
        let newLongestStreak = user.longestStreak || 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user.lastActiveDate) {
            const lastActive = new Date(user.lastActiveDate);
            lastActive.setHours(0, 0, 0, 0);
            const diffDays = Math.round((today - lastActive) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                newStreak += 1;
            } else if (diffDays > 1) {
                newStreak = 1;
            } else if (diffDays === 0 && newStreak === 0) {
                newStreak = 1;
            }
        } else {
            newStreak = 1;
        }
        newLongestStreak = Math.max(newStreak, newLongestStreak);

        const updateData = {
            streak: newStreak,
            longestStreak: newLongestStreak,
            lastActiveDate: new Date()
        };

        if (isCorrect) {
            const XP_BY_DIFFICULTY = { 'Easy': 5, 'Medium': 15, 'Hard': 30 };
            const pointsGain = XP_BY_DIFFICULTY[question.difficulty] || 10;
            updateData.$inc = { points: pointsGain, xp: 10 };
        }

        await User.findByIdAndUpdate(userId, updateData);

        res.json({
            success: true,
            isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
        });

    } catch (error) {
        
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
        const uniqueSolvedIds = new Set(
            allAttempts
                .filter(a => a.isCorrect && a.questionId)
                .map(a => a.questionId._id.toString())
        );
        const problemsSolved = uniqueSolvedIds.size;
        
        const accuracy = totalAttempts > 0 ? (correctAttempts.length / totalAttempts) * 100 : 0;
        const studySeconds = allAttempts.reduce((acc, curr) => acc + (curr.timeTakenSeconds || 0), 0);
        const studyHours = studySeconds > 0 ? (studySeconds / 3600) : 0;

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

        // Weekly Activity (trailing 7 days)
        const weeklyActivity = [];
        const todayAtMidnight = new Date();
        todayAtMidnight.setHours(0, 0, 0, 0);
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date(todayAtMidnight);
            d.setDate(d.getDate() - i);
            const nextDay = new Date(d);
            nextDay.setDate(d.getDate() + 1);

            const dayAttempts = allAttempts.filter(a => {
                const attemptTime = new Date(a.attemptedAt);
                return attemptTime >= d && attemptTime < nextDay;
            });
            
            weeklyActivity.push({
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                count: dayAttempts.length
            });
        }

        res.json({
            success: true,
            data: {
                stats,
                subjectProgress,
                strengths,
                weaknesses,
                recentActivity,
                weeklyActivity
            }
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

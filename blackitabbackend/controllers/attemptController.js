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

        // 5. Update User Gamification (Points & streak handled here synchronously for UX, rankings async)
        if (isCorrect) {
            await User.findByIdAndUpdate(userId, {
                $inc: { points: 10 } // Base points for correct answer
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

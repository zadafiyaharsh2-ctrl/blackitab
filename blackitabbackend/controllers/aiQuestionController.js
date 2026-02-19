const axios = require('axios');
const GeneratedQuestion = require('../models/GeneratedQuestion');

const LANGCHAIN_API_URL = process.env.LANGCHAIN_API_URL || 'http://localhost:8000/query';

const QUIZ_API_URL = process.env.QUIZ_API_URL || 'http://127.0.0.1:8000/query';

// POST /api/ai-questions/generate — generate questions using LangChain API
// POST /api/ai-questions/generate — generate questions using LangChain API
const generateQuestions = async (req, res) => {
    try {
        const { topic, difficulty = 'Medium', count = 5 } = req.body;
        const userId = req.user._id;

        if (!topic || !topic.trim()) {
            return res.status(400).json({ success: false, message: 'Topic is required' });
        }

        const questionCount = Math.min(Math.max(parseInt(count) || 5, 1), 20);
        const validDifficulty = ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium';

        // Call the central Python AI Service
        let quizData;
        try {
            const response = await axios.post(QUIZ_API_URL, {
                topic: topic.trim(),
                difficulty: validDifficulty,
                count: questionCount
            }, { timeout: 120000 }); // 2 min timeout
            console.log('AI Service Response:', response.data);
            const rawQuiz = response.data.quiz;
            quizData = typeof rawQuiz === 'string' ? JSON.parse(rawQuiz) : rawQuiz;
            console.log('Parsed Quiz Data:', quizData); 
        } catch (apiError) {
            console.error('AI Service Error (quiz):', apiError.message);
            return res.status(503).json({
                success: false,
                message: 'AI service unavailable. Please ensure the AI server is running.',
                error: apiError.message
            });
        }

        // Validate and normalize
        let questionsList = [];
        if (Array.isArray(quizData)) {
            questionsList = quizData;
        } else if (quizData && Array.isArray(quizData.questions)) {
            questionsList = quizData.questions;
        }

        if (questionsList.length === 0) {
             return res.status(500).json({ success: false, message: 'AI returned an empty or invalid quiz format.' });
        }

        // Validate and sanitize
        const validatedQuestions = questionsList.map(q => ({
            question: q.question || 'Question text missing',
            options: Array.isArray(q.options) && q.options.length === 4
                ? q.options.map(String)
                : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: typeof q.correct_answer === 'string' 
                ? (['A','B','C','D'].indexOf(q.correct_answer) !== -1 ? ['A','B','C','D'].indexOf(q.correct_answer) : 0)
                : (typeof q.correctAnswer === 'number' ? q.correctAnswer : 0),
            explanation: q.explanation || 'No explanation provided.'
        }));

        // Save to database
        const savedSet = await GeneratedQuestion.create({
            userId,
            topic: topic.trim(),
            difficulty: validDifficulty,
            questions: validatedQuestions,
            questionCount: validatedQuestions.length
        });

        res.json({
            success: true,
            data: savedSet
        });
    } catch (error) {
        console.error('Generate Questions Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate questions', error: error.message });
    }
};

// GET /api/ai-questions/history — paginated history of generated question sets
const getQuestionHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [sets, total] = await Promise.all([
            GeneratedQuestion.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('topic difficulty questionCount createdAt'),
            GeneratedQuestion.countDocuments({ userId })
        ]);

        res.json({
            success: true,
            data: sets,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Get Question History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch history', error: error.message });
    }
};

// GET /api/ai-questions/:id — get a specific question set with full details
const getQuestionSet = async (req, res) => {
    try {
        const set = await GeneratedQuestion.findOne({ _id: req.params.id, userId: req.user._id });
        if (!set) {
            return res.status(404).json({ success: false, message: 'Question set not found' });
        }
        res.json({ success: true, data: set });
    } catch (error) {
        console.error('Get Question Set Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch question set', error: error.message });
    }
};

// DELETE /api/ai-questions/:id — delete a question set
const deleteQuestionSet = async (req, res) => {
    try {
        const set = await GeneratedQuestion.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!set) {
            return res.status(404).json({ success: false, message: 'Question set not found or unauthorized' });
        }
        res.json({ success: true, message: 'Question set deleted successfully' });
    } catch (error) {
        console.error('Delete Question Set Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete question set', error: error.message });
    }
};

module.exports = { generateQuestions, getQuestionHistory, getQuestionSet, deleteQuestionSet };

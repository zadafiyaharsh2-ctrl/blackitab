const axios = require('axios');
const AIQuestion = require('../models/AIQuestion');

const LANGCHAIN_API_URL = process.env.LANGCHAIN_API_URL || 'http://localhost:8000/query';

// POST /api/ai/ask — send question to LangChain API and save response
const askQuestion = async (req, res) => {
    try {
        const { query, top_k = 3, sessionId } = req.body;
        const userId = req.user._id;

        if (!query || !query.trim()) {
            return res.status(400).json({ success: false, message: 'Query is required' });
        }

        let aiResponse;
        try {
            const response = await axios.post(LANGCHAIN_API_URL, { query: query.trim(), top_k }, { timeout: 60000 });
            aiResponse = response.data;
        } catch (apiError) {
            console.error('LangChain API Error:', apiError.message);
            return res.status(503).json({ success: false, message: 'AI service is currently unavailable. Please try again later.', error: apiError.message });
        }

        const savedQuestion = await AIQuestion.create({
            userId,
            question: query.trim(),
            answer: aiResponse.answer || aiResponse.response || 'No response received',
            topK: top_k,
            sources: aiResponse.sources || [],
            sessionId: sessionId || null
        });

        res.json({
            success: true,
            data: { id: savedQuestion._id, question: savedQuestion.question, answer: savedQuestion.answer, sources: savedQuestion.sources, createdAt: savedQuestion.createdAt }
        });
    } catch (error) {
        console.error('Ask Question Error:', error);
        res.status(500).json({ success: false, message: 'Failed to process your question', error: error.message });
    }
};

// GET /api/ai/history — paginated question history
const getHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [questions, total] = await Promise.all([
            AIQuestion.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).select('question answer sources createdAt sessionId'),
            AIQuestion.countDocuments({ userId })
        ]);

        res.json({ success: true, data: questions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        console.error('Get History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch history', error: error.message });
    }
};

// DELETE /api/ai/:id — delete a question
const deleteQuestion = async (req, res) => {
    try {
        const question = await AIQuestion.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!question) return res.status(404).json({ success: false, message: 'Question not found or unauthorized' });
        res.json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete Question Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete question', error: error.message });
    }
};

// DELETE /api/ai/history/clear — clear all history
const clearHistory = async (req, res) => {
    try {
        await AIQuestion.deleteMany({ userId: req.user._id });
        res.json({ success: true, message: 'History cleared successfully' });
    } catch (error) {
        console.error('Clear History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to clear history', error: error.message });
    }
};

module.exports = { askQuestion, getHistory, deleteQuestion, clearHistory };

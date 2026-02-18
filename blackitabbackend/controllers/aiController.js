const axios = require('axios');
const AIQuestion = require('../models/AIQuestion');
const ChatHistory = require('../models/ChatHistory');

const LANGCHAIN_API_URL = process.env.LANGCHAIN_API_URL || 'http://localhost:8000/query';

// POST /api/ai/query — BlackBookEDU.ai-style: conversation thread with chat history
const queryAI = async (req, res) => {
    const { query } = req.body;
    const userId = req.user._id;

    if (!query || !query.trim()) {
        return res.status(400).json({ ok: false, message: 'Query is required' });
    }

    try {
        let chatHistory = await ChatHistory.findOne({ userId });
        if (!chatHistory) {
            chatHistory = new ChatHistory({ userId, messages: [] });
        }

        const userMessage = { role: 'user', content: query.trim() };
        chatHistory.messages.push(userMessage);

        let aiResponseContent = '';
        try {
            const response = await axios.post(LANGCHAIN_API_URL, {
                query: query.trim(),
                top_k: 3
            }, { timeout: 60000 });
            aiResponseContent = response.data.answer || response.data.response || 'No response received';
        } catch (err) {
            console.error('AI Server Error:', err.message);
            aiResponseContent = 'I am currently unable to reach the AI engine. Please try again later.';
        }

        const aiMessage = { role: 'assistant', content: aiResponseContent };
        chatHistory.messages.push(aiMessage);

        await chatHistory.save();

        res.json({
            ok: true,
            session: { id: chatHistory._id, messages: [aiMessage] },
            aiResponse: aiMessage
        });
    } catch (err) {
        console.error('Error processing AI query:', err);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
};

// GET /api/ai/chat-history — get full conversation history for current user
const getChatHistory = async (req, res) => {
    try {
        const history = await ChatHistory.findOne({ userId: req.user._id });
        res.json({ ok: true, messages: history ? history.messages : [] });
    } catch (err) {
        console.error('Error fetching chat history:', err);
        res.status(500).json({ ok: false, message: 'Failed to fetch chat history' });
    }
};

// POST /api/ai/ask — original blackitab style: individual Q&A documents
const askQuestion = async (req, res) => {
    try {
        const { query, top_k = 3, sessionId } = req.body;
        const userId = req.user._id;

        if (!query || !query.trim()) {
            return res.status(400).json({ success: false, message: 'Query is required' });
        }

        let aiResponse;
        try {
            const response = await axios.post(ASK_URL, { query: query.trim(), top_k }, { timeout: 60000 });
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

// GET /api/ai/history — paginated question history (original blackitab style)
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

// DELETE /api/ai/history/clear — clear all history (both models)
const clearHistory = async (req, res) => {
    try {
        await AIQuestion.deleteMany({ userId: req.user._id });
        await ChatHistory.findOneAndDelete({ userId: req.user._id });
        res.json({ success: true, message: 'History cleared successfully' });
    } catch (error) {
        console.error('Clear History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to clear history', error: error.message });
    }
};

module.exports = { askQuestion, getHistory, deleteQuestion, clearHistory, queryAI, getChatHistory };

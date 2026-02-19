const axios = require('axios');
const GeneratedQuestion = require('../models/GeneratedQuestion');

const LANGCHAIN_API_URL = process.env.LANGCHAIN_API_URL || 'http://127.0.0.1:8000/query';

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

        console.log(`Generating ${questionCount} ${validDifficulty} questions on "${topic}" for user ${userId}`);

        // Construct the prompt for the AI
        const prompt = `
        You are an expert exam setter. Create a ${validDifficulty} difficulty multiple-choice quiz about "${topic}".
        
        Generate exactly ${questionCount} questions.
        
        You MUST output ONLY a valid JSON object with the following structure:
        {
            "questions": [
                {
                    "question": "The question text here?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": 0, // Index of the correct option (0, 1, 2, or 3)
                    "explanation": "Brief explanation of why this answer is correct."
                }
            ]
        }
        
        Rules:
        1. "options" must contain exactly 4 distinct strings.
        2. "correctAnswer" must be an integer: 0, 1, 2, or 3.
        3. "explanation" should be educational.
        4. Do NOT include any markdown formatting (like \`\`\`json) in your response, just the raw JSON string.
        5. Ensure the JSON is valid and can be parsed by JSON.parse().
        `;

        // Call the central AI Service (LangChain API)
        let quizData;
        try {
            console.log('Sending prompt to AI...', { url: LANGCHAIN_API_URL });
            const response = await axios.post(LANGCHAIN_API_URL, {
                query: prompt,
                top_k: 3 // consistent with other AI calls
            }, { timeout: 120000 }); // 2 min timeout

            console.log('AI Service Response Status:', response.status);
            
            // The LangChain API likely returns { answer: "String response", ... } or { response: "String response" }
            // Based on aiController.js logic:
            const aiText = response.data.answer || response.data.response || '';
            
            if (!aiText) {
                throw new Error('Empty response from AI service');
            }

            console.log('AI Raw Text Response length:', aiText.length);

            // Extract JSON from the response (in case AI adds markdown text around it)
            // Look for the first '{' and last '}'
            const jsonStartIndex = aiText.indexOf('{');
            const jsonEndIndex = aiText.lastIndexOf('}');
            
            if (jsonStartIndex === -1 || jsonEndIndex === -1) {
                console.error('AI Response (Failure):', aiText);
                throw new Error('AI did not return a valid JSON object');
            }

            const jsonString = aiText.substring(jsonStartIndex, jsonEndIndex + 1);
            
            try {
                const parsed = JSON.parse(jsonString);
                // Handle potential wrapper keys provided by AI
                if (parsed.quiz) quizData = parsed.quiz;
                else if (parsed.data) quizData = parsed.data;
                else quizData = parsed;
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Failed JSON String:', jsonString);
                throw new Error('Failed to parse AI response as JSON');
            }

        } catch (apiError) {
            console.error('AI Service Error:', apiError.message);
            // If it's a response error, log details
            if (apiError.response) {
                console.error('AI Error Data:', apiError.response.data);
            }
            return res.status(503).json({
                success: false,
                message: 'AI service unavailable or failed to generate valid JSON. Please try again.',
                error: apiError.message
            });
        }

        // Validate and normalize
        let questionsList = [];
        if (quizData && Array.isArray(quizData.questions)) {
            questionsList = quizData.questions;
        } else if (Array.isArray(quizData)) {
            questionsList = quizData;
        }

        if (questionsList.length === 0) {
            console.error('Invalid Quiz Data Structure:', quizData);
             return res.status(500).json({ success: false, message: 'AI returned an empty or invalid quiz format.' });
        }

        // Validate and sanitize specific fields
        const validatedQuestions = questionsList.map((q, idx) => ({
            question: q.question || `Question ${idx + 1}`,
            options: Array.isArray(q.options) && q.options.length >= 2
                ? q.options.slice(0, 4).map(String) // Ensure max 4 options
                : ['True', 'False', 'Yes', 'No'], // Fallback
            correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4
                ? q.correctAnswer
                : 0, // Default to A if invalid
            explanation: q.explanation || 'No explanation provided.'
        }));

        // Fill up to 4 options if needed (rare edge case)
        validatedQuestions.forEach(q => {
            while (q.options.length < 4) {
                q.options.push(`Option ${String.fromCharCode(65 + q.options.length)}`);
            }
        });

        console.log(`Successfully parsed ${validatedQuestions.length} questions`);

        // Save to database
        const savedSet = await GeneratedQuestion.create({
            userId,
            topic: topic.trim(),
            difficulty: validDifficulty,
            questions: validatedQuestions,
            questionCount: validatedQuestions.length
            // quizId or other metadata could be added here
        });

        res.json({
            success: true,
            data: savedSet
        });
    } catch (error) {
        console.error('Generate Questions Global Error:', error);
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

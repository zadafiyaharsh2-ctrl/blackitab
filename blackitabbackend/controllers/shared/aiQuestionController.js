const axios = require('axios');
const ExamQuestion = require('../../models/ExamQuestion');

const VALID_EXAMS = ['jee', 'neet', 'upsc', 'gate', 'cat'];

// POST /api/ai-questions/generate — generate questions and save to ExamQuestion
const generateQuestions = async (req, res) => {
    try {
        const { topic, difficulty = 'Medium', count = 5, exam = 'jee', format = 'Digital' } = req.body;
        const LANGCHAIN_API_URL = process.env.LANGCHAIN_API_URL || 'http://127.0.0.1:8000/query';

        if (!topic || !topic.trim()) {
            return res.status(400).json({ success: false, message: 'Topic is required' });
        }

        if (!VALID_EXAMS.includes(exam)) {
            return res.status(400).json({ success: false, message: `Invalid exam. Must be one of: ${VALID_EXAMS.join(', ')}` });
        }

        const questionCount = Math.min(Math.max(parseInt(count) || 5, 1), 20);
        const validDifficulty = ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium';
        const validFormat = ['Digital', 'Paper'].includes(format) ? format : 'Digital';


        const prompt = `
        You are an expert exam setter. Create a ${validDifficulty} difficulty multiple-choice quiz about "${topic}".
        
        Generate exactly ${questionCount} questions.
        
        You MUST output ONLY a valid JSON object with the following structure:
        {
            "questions": [
                {
                    "question": "The question text here?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": 0,
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
        6. The questions should be related to the topic "${topic}".
        7. The questions should be of ${validDifficulty} difficulty.

        Important:
        The data for the topics of the questions should first be checked on the provided documents. If you find the related concepts then ask questions based on that. 
        If you DO NOT find the related concepts in the documents, YOU MUST USE YOUR GENERAL KNOWLEDGE to generate the JSON rather than returning an error.
        DO NOT output any conversational text like "Here is the quiz" or "I could not find the information". OUTPUT ONLY THE JSON OBJECT.
        `;

        let quizData;
        try {

            const response = await axios.post(LANGCHAIN_API_URL, {
                query: prompt,
                top_k: 3
            }, { timeout: 120000 });


            const aiText = response.data.answer || response.data.response || '';

            if (!aiText) {
                throw new Error('Empty response from AI service');
            }


            const jsonStartIndex = aiText.indexOf('{');
            const jsonEndIndex = aiText.lastIndexOf('}');

            if (jsonStartIndex === -1 || jsonEndIndex === -1) {

                throw new Error('AI did not return a valid JSON object');
            }

            const jsonString = aiText.substring(jsonStartIndex, jsonEndIndex + 1);

            try {
                const parsed = JSON.parse(jsonString);
                if (parsed.quiz) quizData = parsed.quiz;
                else if (parsed.data) quizData = parsed.data;
                else quizData = parsed;
            } catch (parseError) {


                throw new Error('Failed to parse AI response as JSON');
            }

        } catch (apiError) {
            console.error('Inner AI API/Parse Error:', apiError.message || apiError);
            if (apiError.response) {
                console.error('Axios Response Data:', apiError.response.data);
            }
            return res.status(503).json({
                success: false,
                message: 'AI service unavailable or failed to generate valid JSON. Please try again.',
                errorDetails: apiError.message
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

            return res.status(500).json({ success: false, message: 'AI returned an empty or invalid quiz format.' });
        }

        // Validate and sanitize specific fields
        const validatedQuestions = questionsList.map((q, idx) => ({
            question: q.question || `Question ${idx + 1}`,
            options: Array.isArray(q.options) && q.options.length >= 2
                ? q.options.slice(0, 4).map(String)
                : ['True', 'False', 'Yes', 'No'],
            correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4
                ? q.correctAnswer
                : 0,
            explanation: q.explanation || 'No explanation provided.'
        }));

        // Fill up to 4 options if needed
        validatedQuestions.forEach(q => {
            while (q.options.length < 4) {
                q.options.push(`Option ${String.fromCharCode(65 + q.options.length)}`);
            }
        });


        // Save each question as an individual ExamQuestion document
        const savedQuestions = await ExamQuestion.insertMany(
            validatedQuestions.map(q => ({
                exam: exam,
                subject: topic.trim(),
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                difficulty: validDifficulty,
                explanation: q.explanation,
                isAiGenerated: true,
                format: validFormat,
                status: 'Draft',
                isGlobal: false,
                createdBy: req.user._id,
                instituteId: req.user.instituteId || null,
                departmentId: req.user.departmentId || null,
                isModerated: false,
                isActive: true
            }))
        );


        res.json({
            success: true,
            data: {
                exam,
                subject: topic.trim(),
                difficulty: validDifficulty,
                questionCount: savedQuestions.length,
                questions: savedQuestions
            }
        });
    } catch (error) {
        console.error('AI Generation Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Unable to save generated questions. Please verify your profile setup and try again.',
                error: error.message
            });
        }
        res.status(500).json({ success: false, message: 'Failed to generate questions', error: error.message });
    }
};

module.exports = { generateQuestions };

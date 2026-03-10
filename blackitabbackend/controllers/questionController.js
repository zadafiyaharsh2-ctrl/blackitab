const axios = require('axios');
const QuestionGenerated = require('../models/QuestionGenerated');
const ExamQuestion = require('../models/ExamQuestion');
const { ROLE_HIERARCHY } = require('../middleware/roleMiddleware');

const LANGCHAIN_API_URL = process.env.LANGCHAIN_API_URL || 'http://127.0.0.1:8000/query';
const VALID_EXAMS = ['jee', 'neet', 'upsc', 'gate', 'cat'];

// ══════════════════════════════════════════════════════════════
// HELPER: Ownership & hierarchy check
// ══════════════════════════════════════════════════════════════

function canModify(question, user) {
    const isCreator = question.createdBy?.toString() === user._id.toString();
    if (isCreator) return true;

    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    if (userLevel >= ROLE_HIERARCHY['hod'] &&
        question.instituteId?.toString() === user.instituteId?.toString()) {
        return true;
    }

    return false;
}

// ── Helper: Copy a QuestionGenerated doc to ExamQuestion ──
async function _copyToExamQuestion(q) {
    const existing = await ExamQuestion.findOne({ sourceQuestionId: q._id });
    if (existing) return existing;

    return ExamQuestion.create({
        exam: q.exam,
        subject: q.subject,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        explanation: q.explanation,
        isAiGenerated: q.isAiGenerated,
        topicId: q.topicId,
        tags: q.tags,
        createdBy: q.createdBy,
        instituteId: q.instituteId,
        isPublic: q.isPublic,
        visibility: q.visibility,
        approvalStatus: 'approved',
        isProblem: true,
        sourceQuestionId: q._id
    });
}

// ── Helper: Sync content edits to the ExamQuestion copy ──
async function _syncExamQuestion(q) {
    await ExamQuestion.findOneAndUpdate(
        { sourceQuestionId: q._id },
        {
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            subject: q.subject,
            difficulty: q.difficulty,
            exam: q.exam,
            tags: q.tags
        }
    );
}

// ══════════════════════════════════════════════════════════════
// LIST QUESTIONS
// ══════════════════════════════════════════════════════════════

// GET /api/questions — List my questions (with filters)
exports.listMyQuestions = async (req, res) => {
    try {
        const { subject, difficulty, visibility, exam, page = 1, limit = 20 } = req.query;
        const filter = { createdBy: req.user._id };

        if (subject) filter.subject = new RegExp(subject, 'i');
        if (difficulty) filter.difficulty = difficulty;
        if (visibility) filter.visibility = visibility;
        if (exam) filter.exam = exam;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [questions, total] = await Promise.all([
            QuestionGenerated.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            QuestionGenerated.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: questions,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// CREATE QUESTION (Manual)
// ══════════════════════════════════════════════════════════════

// POST /api/questions — Create a question manually
exports.createQuestion = async (req, res) => {
    try {
        const { exam, subject, question, options, correctAnswer, difficulty, explanation, tags, visibility } = req.body;

        if (!exam || !subject || !question || !options || options.length !== 4 || correctAnswer === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields: exam, subject, question, 4 options, correctAnswer' });
        }

        const newQuestion = await QuestionGenerated.create({
            exam,
            subject,
            question,
            options,
            correctAnswer: parseInt(correctAnswer),
            difficulty: difficulty || 'Medium',
            explanation: explanation || 'No explanation available',
            tags: tags || [],
            visibility: visibility || 'public',
            isPublic: visibility !== 'private',
            approvalStatus: 'pending',
            createdBy: req.user._id,
            instituteId: req.user.instituteId || null
        });

        res.status(201).json({ success: true, data: newQuestion });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// AI QUESTION GENERATION
// ══════════════════════════════════════════════════════════════

// POST /api/questions/generate — AI generates questions (teacher can edit after)
exports.generateQuestions = async (req, res) => {
    try {
        const { topic, difficulty = 'Medium', count = 5, exam = 'jee', visibility = 'public' } = req.body;

        if (!topic || !topic.trim()) {
            return res.status(400).json({ success: false, message: 'Topic is required' });
        }
        if (!VALID_EXAMS.includes(exam)) {
            return res.status(400).json({ success: false, message: `Invalid exam. Must be one of: ${VALID_EXAMS.join(', ')}` });
        }

        const questionCount = Math.min(Math.max(parseInt(count) || 5, 1), 20);
        const validDifficulty = ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium';

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
        The data for the topics of the questions should first be checked on the provided documents, if you find the related concepts then ask questions based on that, if you don't find the related concepts then ask questions based on your knowledge.
        `;

        let quizData;
        try {
            const response = await axios.post(LANGCHAIN_API_URL, {
                query: prompt,
                top_k: 3
            }, { timeout: 120000 });

            const aiText = response.data.answer || response.data.response || '';
            if (!aiText) throw new Error('Empty response from AI service');

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
            return res.status(503).json({
                success: false,
                message: 'AI service unavailable or failed to generate valid JSON. Please try again.'
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

        validatedQuestions.forEach(q => {
            while (q.options.length < 4) {
                q.options.push(`Option ${String.fromCharCode(65 + q.options.length)}`);
            }
        });

        // Save to QuestionGenerated (My Bank)
        const savedQuestions = await QuestionGenerated.insertMany(
            validatedQuestions.map(q => ({
                exam,
                subject: topic.trim(),
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                difficulty: validDifficulty,
                explanation: q.explanation,
                isAiGenerated: true,
                visibility: visibility,
                isPublic: visibility !== 'private',
                createdBy: req.user._id,
                instituteId: req.user.instituteId || null,
                approvalStatus: 'pending'
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
        res.status(500).json({ success: false, message: 'Failed to generate questions' });
    }
};

// ══════════════════════════════════════════════════════════════
// GET SINGLE QUESTION
// ══════════════════════════════════════════════════════════════

// GET /api/questions/:id
exports.getQuestion = async (req, res) => {
    try {
        const question = await QuestionGenerated.findById(req.params.id)
            .populate('createdBy', 'name email role');
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        if (question.visibility === 'private' && !canModify(question, req.user)) {
            return res.status(403).json({ success: false, message: 'This question is private' });
        }

        if (question.visibility === 'institute') {
            const sameInstitute = question.instituteId?.toString() === req.user.instituteId?.toString();
            if (!sameInstitute) {
                return res.status(403).json({ success: false, message: 'This question is restricted to institute members' });
            }
        }

        res.json({ success: true, data: question });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// UPDATE QUESTION
// ══════════════════════════════════════════════════════════════

// PUT /api/questions/:id
exports.updateQuestion = async (req, res) => {
    try {
        const question = await QuestionGenerated.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        if (!canModify(question, req.user)) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this question' });
        }

        const updates = req.body;
        if (updates.correctAnswer !== undefined) updates.correctAnswer = parseInt(updates.correctAnswer);

        const wasProblem = question.isProblem;
        const willBeProblem = updates.isProblem !== undefined ? updates.isProblem : wasProblem;

        const updated = await QuestionGenerated.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

        // Copy-on-approve flow
        if (!wasProblem && willBeProblem) {
            await _copyToExamQuestion(updated);
        } else if (wasProblem && !willBeProblem) {
            await ExamQuestion.deleteOne({ sourceQuestionId: req.params.id });
        } else if (wasProblem && willBeProblem) {
            await _syncExamQuestion(updated);
        }

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// DELETE QUESTION
// ══════════════════════════════════════════════════════════════

// DELETE /api/questions/:id
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await QuestionGenerated.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        if (!canModify(question, req.user)) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this question' });
        }

        // Also remove from ExamQuestion if it was in Problems
        if (question.isProblem) {
            await ExamQuestion.deleteOne({ sourceQuestionId: req.params.id });
        }

        await QuestionGenerated.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// VISIBILITY TOGGLE
// ══════════════════════════════════════════════════════════════

// PUT /api/questions/:id/visibility — Toggle private/institute/public
exports.changeVisibility = async (req, res) => {
    try {
        const { visibility } = req.body;
        if (!['private', 'institute', 'public'].includes(visibility)) {
            return res.status(400).json({ success: false, message: 'visibility must be: private, institute, or public' });
        }

        const question = await QuestionGenerated.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        if (!canModify(question, req.user)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        question.visibility = visibility;
        question.isPublic = visibility !== 'private';
        await question.save();

        res.json({ success: true, data: question });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// INSTITUTE-SCOPED VIEWS
// ══════════════════════════════════════════════════════════════

// GET /api/questions/institute — All questions in my institute
exports.listInstituteQuestions = async (req, res) => {
    try {
        if (!req.user.instituteId) {
            return res.status(400).json({ success: false, message: 'Not linked to an institute' });
        }

        const { page = 1, limit = 20, subject, difficulty, status } = req.query;
        const filter = { instituteId: req.user.instituteId };

        if (subject) filter.subject = new RegExp(subject, 'i');
        if (difficulty) filter.difficulty = difficulty;
        if (status) filter.approvalStatus = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [questions, total] = await Promise.all([
            QuestionGenerated.find(filter)
                .populate('createdBy', 'name email role')
                .sort({ createdAt: -1 })
                .skip(skip).limit(parseInt(limit)),
            QuestionGenerated.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: questions,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/questions/institute/pending — Pending approval queue
exports.listPendingQuestions = async (req, res) => {
    try {
        if (!req.user.instituteId) {
            return res.status(400).json({ success: false, message: 'Not linked to an institute' });
        }

        const questions = await QuestionGenerated.find({
            instituteId: req.user.instituteId,
            approvalStatus: 'pending'
        })
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: questions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

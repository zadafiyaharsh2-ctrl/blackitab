const axios = require('axios');
const ProblemSubject = require('../models/ProblemSubject');
const ExamQuestion = require('../models/ExamQuestion');
const ProblemChapter = require('../models/ProblemChapter');
const Problem = require('../models/Problem');
const ProblemProgress = require('../models/ProblemProgress');

// GET /api/problems/subjects — all problem subjects
exports.getProblemSubjects = async (req, res) => {
    try {
        const subjects = await ProblemSubject.find().sort({ createdAt: 1 });
        res.status(200).json({ success: true, count: subjects.length, data: subjects });
    } catch (err) {
        console.error('Error fetching problem subjects:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/problems/subjects — create a new subject (Admin)
exports.createProblemSubject = async (req, res) => {
    try {
        const subject = await ProblemSubject.create(req.body);
        res.status(201).json({ success: true, data: subject });
    } catch (err) {
        console.error('Error creating problem subject:', err);
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Subject already exists' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/problems/subjects/:subjectId/chapters
exports.getChaptersBySubject = async (req, res) => {
    try {
        const chapters = await ProblemChapter.find({ subjectId: req.params.subjectId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, count: chapters.length, data: chapters });
    } catch (err) {
        console.error('Error fetching problem chapters:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/problems/chapters/:chapterId/problems — with user progress merged in
exports.getProblemsByChapter = async (req, res) => {
    try {
        const problems = await Problem.find({ chapterId: req.params.chapterId }).sort({ order: 1 });

        let problemsWithStatus = problems.map(p => ({ ...p.toObject(), status: 'not_attempted' }));

        // If user is logged in, merge their progress
        if (req.user) {
            const problemIds = problems.map(p => p._id);
            const progress = await ProblemProgress.find({ userId: req.user.id, problemId: { $in: problemIds } });

            const progressMap = {};
            progress.forEach(p => { progressMap[p.problemId.toString()] = p.status; });

            problemsWithStatus = problems.map(p => ({
                ...p.toObject(),
                status: progressMap[p._id.toString()] || 'not_attempted'
            }));
        }

        res.status(200).json({ success: true, count: problemsWithStatus.length, data: problemsWithStatus });
    } catch (err) {
        console.error('Error fetching problems:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/problems/:id — single problem
exports.getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }
        res.status(200).json({ success: true, data: problem });
    } catch (err) {
        console.error('Error fetching problem:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Helper: update streak and add points after completing a problem
const updateUserStreakAndPoints = async (userId, pointsToAdd) => {
    const User = require('../models/User');
    const user = await User.findById(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    if (!lastActive) {
        user.streak = 1;
        user.lastActiveDate = new Date();
    } else {
        const diffDays = Math.ceil(Math.abs(today - lastActive) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            user.streak += 1;
            user.lastActiveDate = new Date();
        } else if (diffDays > 1) {
            user.streak = 1;
            user.lastActiveDate = new Date();
        } else {
            user.lastActiveDate = new Date();
        }
    }

    user.points = (user.points || 0) + pointsToAdd;
    await user.save();
};

// POST /api/problems/:id/status — mark problem as 'completed' or 'attempted'
// Awards 20 points on first completion only
exports.updateProblemStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['completed', 'attempted'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        let progress = await ProblemProgress.findOne({ userId: req.user.id, problemId: req.params.id });

        if (progress) {
            const wasCompleted = progress.status === 'completed';
            progress.status = status;
            progress.updatedAt = Date.now();

            if (status === 'completed' && !wasCompleted) {
                progress.completedAt = Date.now();
                await updateUserStreakAndPoints(req.user.id, 20);
            }
            await progress.save();
        } else {
            progress = await ProblemProgress.create({
                userId: req.user.id,
                problemId: req.params.id,
                status,
                completedAt: status === 'completed' ? Date.now() : undefined
            });

            if (status === 'completed') {
                await updateUserStreakAndPoints(req.user.id, 20);
            }
        }

        res.status(200).json({ success: true, data: progress });
    } catch (err) {
        console.error('Error updating problem status:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// GET /api/problems/exam/:examId/questions
exports.getExamQuestions = async (req, res) => {
    try {
        const { examId } = req.params;
        const { subject } = req.query;
        const filter = { exam: examId };
        if (subject) filter.subject = subject;

        const questions = await ExamQuestion.find(filter)
            .select('-correctAnswer -explanation')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: questions });
    } catch (err) {
        console.error('Error fetching exam Questions: ', err);
        res.status(500).json({ success: false, message: 'Server Error' });

    }
};



exports.checkExamAnswer = async (req, res) => {
    try {
        const { questionId, selectedOption } = req.body;
        const question = await ExamQuestion.findById(questionId);
        if (!question) {
            return res.status(400).json({ success: false, message: 'Question not found' });
        }
        const isCorrect = question.correctAnswer === selectedOption;
        res.json({
            success: true,
            data: isCorrect ? { correct: true, correctAnswer: question.correctAnswer } : { correct: false }
        });
    } catch (err) {
        console.error('Error checking answer:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


exports.generateExamQuestions = async (req, res) => {
    try {
        const { examId } = req.params;
        const { subject = 'Physics', count = 3, difficulty = 'Medium' } = req.body;

        const dummyGenerated = []  /// need to repalce with api Ai
        for (let i = 0; i < count; i++) {
            dummyGenerated.push({
                exam: examId, subject,
                question: `[AI Generated] Sample ${subject} question #${i + 1} for ${examId.toUpperCase()}?`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: Math.floor(Math.random() * 4),
                difficulty, explanation: 'AI-generated dummy explanation.',
                isAIGenerated: true
            });
        }
        /// up until this


        const saved = await ExamQuestion.insertMany(dummyGenerated);
        const safeQuestions = saved.map(q => ({
            _id: q._id, exam: q.exam, subject: q.subject,
            question: q.question, options: q.options,
            difficulty: q.difficulty, isAIGenerated: q.isAIGenerated
        }));
        res.json({ success: true, data: safeQuestions });

    } catch (err) {
        console.error('Error generateing questions: ', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// POST /api/problems/exam/:examId/ai-tutor
// POST /api/problems/exam/:examId/ai-tutor
exports.startAiTutor = async (req, res) => {
    try {
        const { questionId, userAnswer, sessionHistory = [] } = req.body;
        const question = await ExamQuestion.findById(questionId);

        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const step = sessionHistory.length;
        const LANGCHAIN_API_URL = process.env.LANGCHAIN_API_URL || 'http://127.0.0.1:8000/query';

        // --- PROMPT ENGINEERING ---
        let systemContext, userTask, outputFormat;

        if (step >= 5) {
            // FORCE THEORY EXIT
            systemContext = `You are a world-class Expert Tutor. A student is STUCK on a Concept. They have failed multiple attempts.`;
            userTask = `
            Context: The student is stuck on a ${question.subject} question: "${question.question}".
            
            YOUR TASK:
            1. Identify the CORE CONCEPT required to solve this.
            2. Provide a clear, high-quality THEORY EXPLANATION (Study Text) for this concept.
            3. Do NOT ask another question. The student needs to study now.
            4. Make the explanation educational, easy to understand, and complete.
            `;
            outputFormat = `
            Output ONLY valid JSON:
            {
                "action": "study_theory",
                "message": "It seems we need to review the core concept. Here is a study guide for you:",
                "studyText": "## Concept Name\\n\\nDetailed explanation here use Markdown...",
                "isResolved": false
            }
            `;
        } else {
            // REMEDIAL QUESTION - BRANCHING LOGIC
            systemContext = `You are a Socratic Tutor. Your goal is to help a student understand a complex problem.
            
            STRATEGY:
            - If the problem involves MULTIPLE concepts (e.g. Rotation + Friction), BREAK IT DOWN. Generate 2 separate simpler questions, one for each concept.
            - If it's a single concept, generate 1 simpler precursor question.
            - Questions must be Multiple Choice.`;

            userTask = `
            Context:
            - Extension/Subject: ${question.subject}
            - Difficulty: ${question.difficulty}
            - Original Question: "${question.question}"
            - Correct Answer: "${question.options[question.correctAnswer]}"
            - Student's Wrong Answer Index: ${userAnswer}
            
            YOUR TASK:
            1. Diagnose why the student might have chosen the wrong answer.
            2. Create a NEW, SIMPLER multiple-choice question that tests the *prerequisite* knowledge for the original question.
            3. The new question MUST be easier than the original.
            4. Do NOT simply repeat the original question.

            One Example:
            Suppose the Answer of a Question is acceleration = final veocity - initial velocity / Time taken
            then you should be able to ask the student , the questions related to velocity then if he again gives a wrong answer , you should then ask him about displacement and if he then gives the correct answer , you should then ask him about time taken and if he then gives the correct answer , you should then ask him about acceleration and if he then gives the correct answer , you should then ask him about the original question.
            `;
            outputFormat = `
            Output ONLY valid JSON:
            {
                "action": "continue",
                "message": "Let's break this down into steps.",
                "newQuestions": [
                    {
                        "question": "Step 1: Simpler question text...",
                        "options": ["A", "B", "C", "D"],
                        "correctAnswer": 0,
                        "explanation": "Brief hint."
                    }
                    // Add a second question object here if breaking down a complex topic
                ],
                "isResolved": false
            }
            `;
        }

        const prompt = `${systemContext}\n\n${userTask}\n\n${outputFormat}\n\nIMPORTANT: Return ONLY the raw JSON string. No markdown formatting.`;

        // --- API CALL & ROBUST PARSING ---
        try {
            console.log('AI Tutor: Sending request to AI...', { step, subject: question.subject });
            const aiRes = await axios.post(LANGCHAIN_API_URL, {
                query: prompt,
                top_k: 3
            }, { timeout: 120000 }); // 2 min timeout for complex generation
            console.log(aiRes)
            let aiText = aiRes.data.answer || aiRes.data.response || '';
            console.log(aiText)
            if (!aiText) throw new Error('Empty response from AI');

            // Robust JSON Extraction
            const jsonStartIndex = aiText.indexOf('{');
            const jsonEndIndex = aiText.lastIndexOf('}');

            if (jsonStartIndex === -1 || jsonEndIndex === -1) {
                console.error('AI Tutor: Failed to find JSON in response:', aiText);
                throw new Error('Invalid JSON format from AI');
            }

            const jsonString = aiText.substring(jsonStartIndex, jsonEndIndex + 1);
            let aiData;

            try {
                aiData = JSON.parse(jsonString);
            } catch (pErr) {
                console.error('AI Tutor: JSON Parse Error:', pErr);
                console.error('Failed JSON string:', jsonString);
                throw new Error('JSON Parse Failed');
            }

            res.json({
                success: true,
                data: {
                    ...aiData,
                    history: [...sessionHistory, { step, userAnswer, aiData }]
                }
            });

        } catch (aiErr) {
            console.error('AI Tutor Service Error:', aiErr.message);

            // Generate a basic fallback response to keep the UI functional
            res.json({
                success: true,
                data: {
                    action: 'study_theory',
                    message: 'I am having trouble generating a new question right now. However, reviewing this topic in your textbook will be very helpful!',
                    studyText: `### Self Study Recommendation
                    
                    **Topic:** ${question.subject}
                    
                    Please review the core concepts for this topic. Focus on:
                    - Fundamental definitions
                    - Key formulas
                    - Common problem types
                    `,
                    isResolved: false,
                    history: [...sessionHistory]
                }
            });
        }

    } catch (err) {
        console.error('Error in AI tutor:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

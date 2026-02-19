import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Sparkles,
    Loader2,
    BookOpen,
    Filter,
    ChevronLeft,
    ChevronRight,
    BrainCircuit,
    Book
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API_URL from '../config';

const ExamQuestions = () => {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [results, setResults] = useState({});
    const [activeSubject, setActiveSubject] = useState('All');
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    // const [generating, setGenerating] = useState(false);
    const [checkingId, setCheckingId] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [tutorSessions, setTutorSessions] = useState({});

    const [followUpAnswers, setFollowUpAnswers] = useState({});
    const [followUpResults, setFollowUpResults] = useState({});

    const examMeta = {
        jee: { name: 'JEE', subjects: ['Physics', 'Chemistry', 'Mathematics'], color: 'purple' },
        neet: { name: 'NEET', subjects: ['Biology', 'Chemistry', 'Physics'], color: 'green' },
        upsc: { name: 'UPSC', subjects: ['General Studies', 'Current Affairs', 'Essay'], color: 'blue' },
        gate: { name: 'GATE', subjects: ['Core Engineering', 'Aptitude', 'Mathematics'], color: 'orange' },
        cat: { name: 'CAT', subjects: ['Quantitative Ability', 'Verbal Ability', 'Logical Reasoning'], color: 'pink' },
    };

    const currentExam = examMeta[examId] || { name: examId?.toUpperCase(), subjects: [], color: 'purple' };

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const url = activeSubject === 'All'
                    ? `${API_URL}/api/problems/exam/${examId}/questions`
                    : `${API_URL}/api/problems/exam/${examId}/questions?subject=${activeSubject}`;
                const res = await axios.get(url);
                if (res.data.success) {
                    setQuestions(res.data.data);
                    setCurrentIndex(0);
                }
            } catch (err) {
                console.error('Error fetching exam questions:', err);
            } finally {
                setLoading(false);
            }
        };
        if (examId) fetchQuestions();
    }, [examId, activeSubject]);

    const handleSelectOption = (questionId, optionIndex) => {
        if (results[questionId]) return;
        setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleFollowUpSubmit = async (questionId) => {
        const selected = followUpAnswers[questionId];
        if (selected === undefined) return;

        const session = tutorSessions[questionId];
        const correctIdx = session.followUpQuestion.correctAnswer;
        const isCorrect = selected === correctIdx;

        // Store the result to show correct/incorrect styling
        setFollowUpResults(prev => ({ ...prev, [questionId]: { selected, correctIdx, isCorrect } }));

        // Wait 1.5s to let user see the feedback
        await new Promise(r => setTimeout(r, 2500));

        // Clear the follow-up result
        setFollowUpResults(prev => { const n = { ...prev }; delete n[questionId]; return n; });

        const newCorrectCount = (session.correctCount || 0) + (isCorrect ? 1 : 0);

        if (isCorrect && newCorrectCount >= 3) {
            // 3 correct answers reached — resolve the tutor!
            setTutorSessions(prev => ({
                ...prev,
                [questionId]: { ...prev[questionId], isResolved: true, followUpQuestion: null, correctCount: newCorrectCount, message: 'Excellent! You nailed all it' }
            }));
            setFollowUpAnswers(prev => ({ ...prev, [questionId]: undefined }));
        } else {
            // Either wrong OR correct but haven't hit 3 yet — fetch next question
            try {
                setAnalyzing(true);
                const token = localStorage.getItem('token');
                const res = await axios.post(
                    `${API_URL}/api/problems/exam/${examId}/ai-tutor`,
                    {
                        questionId,
                        userAnswer: selected,
                        sessionHistory: session.history || []
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data.success) {
                    setTutorSessions(prev => ({
                        ...prev,
                        [questionId]: { ...res.data.data, correctCount: newCorrectCount }
                    }));
                    setFollowUpAnswers(prev => ({ ...prev, [questionId]: undefined }));
                }
            } catch (err) {
                console.error('Error in tutor follow-up:', err);
            } finally {
                setAnalyzing(false);
            }
        }
    };


    const startTutorSession = async (questionId) => {
        try {
            setAnalyzing(true); // Freeze screen effect
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API_URL}/api/problems/exam/${examId}/ai-tutor`,
                { questionId, sessionHistory: [] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setTutorSessions(prev => ({ ...prev, [questionId]: res.data.data }));
            }
        } catch (err) {
            console.error('Error starting tutor session:', err);
        } finally {
            setAnalyzing(false);
        }
    }


    const handleSubmitAnswer = async (questionId) => {
        const selectedOption = selectedAnswers[questionId];
        if (selectedOption === undefined) return;

        try {
            setCheckingId(questionId);
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API_URL}/api/problems/exam/${examId}/check-answer`,
                { questionId, selectedOption },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setResults(prev => ({ ...prev, [questionId]: res.data.data }));
            }
            // Logic removed: don't auto-start tutor on wrong answer. User must click "Get Help"
        } catch (err) {
            console.error('Error checking answer:', err);
        } finally {
            setCheckingId(null);
        }
    };

    // const handleAIGenerate = async () => {
    //     try {
    //         setGenerating(true);
    //         const token = localStorage.getItem('token');
    //         const res = await axios.post(
    //             `${API_URL}/api/problems/exam/${examId}/generate`,
    //             {
    //                 subject: activeSubject === 'All' ? currentExam.subjects[0] : activeSubject,
    //                 count: 3,
    //                 difficulty: 'Medium'
    //             },
    //             { headers: { Authorization: `Bearer ${token}` } }
    //         );
    //         if (res.data.success) {
    //             setQuestions(prev => [...res.data.data, ...prev]);
    //         }
    //     } catch (err) {
    //         console.error('Error generating questions:', err);
    //     } finally {
    //         setGenerating(false);
    //     }
    // };

    const getOptionStyle = (questionId, optionIndex) => {
        const result = results[questionId];
        const isSelected = selectedAnswers[questionId] === optionIndex;

        if (!result) {
            return isSelected
                ? 'border-purple-500 bg-purple-500/20 text-white'
                : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-gray-500 hover:bg-gray-700/30';
        }

        if (optionIndex === result.correctAnswer) {
            return 'border-green-500 bg-green-500/20 text-green-300';
        }
        if (isSelected && !result.correct) {
            return 'border-red-500 bg-red-500/20 text-red-300';
        }
        return 'border-gray-700/50 bg-gray-800/20 text-gray-500';
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 relative">
            {/* Analyzing Overlay */}
            {analyzing && (
                <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="bg-gray-800 p-8 rounded-2xl border border-purple-500/50 flex flex-col items-center max-w-sm text-center shadow-2xl shadow-purple-500/20">
                        <Loader2 className="h-12 w-12 text-purple-400 animate-spin mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">AI Agent Analyzing...</h3>
                        <p className="text-gray-400">Identifying your learning gap and preparing a remedial step.</p>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/problems')}
                    className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-4"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Exams
                </button>

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white">
                            {currentExam.name}{' '}
                            <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                                Practice
                            </span>
                        </h1>
                        <p className="text-gray-400 mt-2">
                            {questions.length} question{questions.length !== 1 ? 's' : ''} available
                        </p>
                    </div>

                    {/* AI Generate Button */}
                    {/* <button
                        onClick={handleAIGenerate}
                        disabled={generating}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 disabled:cursor-not-allowed"
                    >
                        {generating ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Sparkles className="h-5 w-5" />
                        )}
                        {generating ? 'Generating...' : 'Generate AI Questions'}
                    </button> */}
                </div>
            </div>

            {/* Subject Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                <button
                    onClick={() => setActiveSubject('All')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSubject === 'All'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                        : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-500'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        All Subjects
                    </div>
                </button>
                {currentExam.subjects.map((subject) => (
                    <button
                        key={subject}
                        onClick={() => setActiveSubject(subject)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSubject === subject
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                            : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-500'
                            }`}
                    >
                        {subject}
                    </button>
                ))}
            </div>

            {/* Questions List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-12 w-12 border-b-2 border-purple-600 rounded-full"></div>
                </div>
            ) : questions.length === 0 ? (
                <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-dashed border-gray-700">
                    <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No questions found for this exam yet.</p>
                    <p className="text-gray-500 text-sm mb-6">Click the button above to generate some AI questions!</p>
                    {/* <button
                        onClick={handleAIGenerate}
                        disabled={generating}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/30"
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Generate Questions
                        </div>
                    </button> */}
                </div>
            ) : (
                <div>
                    {(() => {
                        const q = questions[currentIndex];
                        return (
                            <div
                                key={q._id}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 transition-all"
                            >
                                {/* Question Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full">
                                                Q{currentIndex + 1} of {questions.length}
                                            </span>
                                            {q.subject && (
                                                <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
                                                    {q.subject}
                                                </span>
                                            )}
                                            {q.difficulty && (
                                                <span className={`px-3 py-1 text-xs rounded-full ${q.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                                    q.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {q.difficulty}
                                                </span>
                                            )}
                                            {q.isAIGenerated && (
                                                <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" /> AI
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white text-lg font-medium leading-relaxed">
                                            {q.question}
                                        </p>
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="space-y-3 mb-4">
                                    {q.options.map((opt, optIdx) => (
                                        <button
                                            key={optIdx}
                                            onClick={() => handleSelectOption(q._id, optIdx)}
                                            disabled={results[q._id] !== undefined}
                                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${getOptionStyle(q._id, optIdx)} ${results[q._id] ? 'cursor-default' : 'cursor-pointer'
                                                }`}
                                        >
                                            <span className="w-8 h-8 flex items-center justify-center rounded-full border border-current/30 text-sm font-semibold shrink-0">
                                                {String.fromCharCode(65 + optIdx)}
                                            </span>
                                            <span className="flex-1">{opt}</span>
                                            {results[q._id] && optIdx === results[q._id].correctAnswer && (
                                                <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                                            )}
                                            {results[q._id] && selectedAnswers[q._id] === optIdx && !results[q._id].correct && (
                                                <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Submit / Result */}
                                {!results[q._id] ? (
                                    <button
                                        onClick={() => handleSubmitAnswer(q._id)}
                                        disabled={selectedAnswers[q._id] === undefined || checkingId === q._id}
                                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-2"
                                    >
                                        {checkingId === q._id ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Checking...
                                            </>
                                        ) : (
                                            'Submit Answer'
                                        )}
                                    </button>
                                ) : (
                                    <>
                                        <div className={`p-4 rounded-xl border ${results[q._id].correct
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-red-500/10 border-red-500/30'
                                            }`}>
                                            <div className="flex items-center gap-2">
                                                {results[q._id].correct ? (
                                                    <>
                                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                                        <span className="text-green-400 font-semibold">Correct!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-5 w-5 text-red-400" />
                                                        <span className="text-red-400 font-semibold">Not quite right</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Button: Get AI Help (Manual Trigger) */}
                                        {!results[q._id].correct && !tutorSessions[q._id] && (
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => startTutorSession(q._id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all shadow-lg shadow-purple-900/20"
                                                >
                                                    <BrainCircuit className="h-4 w-4" />
                                                    Stuck? Get AI Help
                                                </button>
                                            </div>
                                        )}

                                        {/* AI Tutor Panel — only on wrong answer */}
                                        {/* AI Tutor Panel */}
                                        {!results[q._id].correct && tutorSessions[q._id] && (
                                            <div className="mt-4 p-5 bg-gray-900/50 border border-purple-500/30 rounded-xl relative overflow-hidden">
                                                {/* Ambient Glow */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full pointer-events-none"></div>

                                                <div className="flex items-center gap-2 mb-4 relative z-10">
                                                    <div className="p-1.5 bg-purple-500/20 rounded-lg">
                                                        <Sparkles className="h-5 w-5 text-purple-400" />
                                                    </div>
                                                    <span className="text-purple-300 font-bold">AI Tutor</span>
                                                </div>

                                                <p className="text-gray-300 text-sm mb-4 leading-relaxed">{tutorSessions[q._id].message}</p>

                                                {/* THEORY MODE */}
                                                {tutorSessions[q._id].action === 'study_theory' && (
                                                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 mb-4">
                                                        <div className="flex items-center gap-2 mb-3 text-blue-400">
                                                            <Book className="h-5 w-5" />
                                                            <span className="font-semibold">Concept Study Required</span>
                                                        </div>
                                                        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {tutorSessions[q._id].studyText}
                                                            </ReactMarkdown>
                                                        </div>
                                                        <div className="mt-4 flex justify-end">
                                                            <button
                                                                onClick={() => {
                                                                    setTutorSessions(prev => ({ ...prev, [q._id]: undefined }));
                                                                    setResults(prev => { const n = { ...prev }; delete n[q._id]; return n; });
                                                                    setSelectedAnswers(prev => { const n = { ...prev }; delete n[q._id]; return n; });
                                                                }}
                                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                I've Studied - Let me try again
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {tutorSessions[q._id].action !== 'study_theory' && !tutorSessions[q._id].isResolved && tutorSessions[q._id].followUpQuestion && (
                                                    <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700/50">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <p className="text-white font-medium text-lg">
                                                                {tutorSessions[q._id].followUpQuestion.question}
                                                            </p>
                                                            {/* <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 whitespace-nowrap ml-3">
                                                                ✓ {tutorSessions[q._id].correctCount || 0}/3 correct
                                                            </span> */}
                                                        </div>
                                                        <div className="space-y-3">
                                                            {tutorSessions[q._id].followUpQuestion.options.map((opt, i) => {
                                                                const fResult = followUpResults[q._id];
                                                                const isSubmitted = !!fResult;
                                                                const isThisCorrect = isSubmitted && i === fResult.correctIdx;
                                                                const isThisWrongPick = isSubmitted && i === fResult.selected && !fResult.isCorrect;
                                                                const isSelected = followUpAnswers[q._id] === i;

                                                                let btnStyle = 'border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-700/50';
                                                                if (isSubmitted) {
                                                                    if (isThisCorrect) btnStyle = 'border-green-500 bg-green-500/20 text-green-300';
                                                                    else if (isThisWrongPick) btnStyle = 'border-red-500 bg-red-500/20 text-red-300';
                                                                    else btnStyle = 'border-gray-700/50 bg-gray-800/20 text-gray-500';
                                                                } else if (isSelected) {
                                                                    btnStyle = 'border-purple-500 bg-purple-500/20 text-white shadow-lg shadow-purple-900/20';
                                                                }

                                                                return (
                                                                    <button key={i}
                                                                        onClick={() => !isSubmitted && setFollowUpAnswers(prev => ({ ...prev, [q._id]: i }))}
                                                                        disabled={isSubmitted}
                                                                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${btnStyle} ${isSubmitted ? 'cursor-default' : ''}`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <span className={`w-6 h-6 flex items-center justify-center rounded-full border text-xs ${isThisCorrect ? 'border-green-400 text-green-300' :
                                                                                isThisWrongPick ? 'border-red-400 text-red-300' :
                                                                                    isSelected && !isSubmitted ? 'border-purple-400 text-purple-300' :
                                                                                        'border-gray-600 text-gray-500'
                                                                                }`}>
                                                                                {String.fromCharCode(65 + i)}
                                                                            </span>
                                                                            <span className="flex-1">{opt}</span>
                                                                            {isThisCorrect && <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />}
                                                                            {isThisWrongPick && <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {!followUpResults[q._id] && (
                                                            <div className="mt-4 flex justify-end">
                                                                <button
                                                                    onClick={() => handleFollowUpSubmit(q._id)}
                                                                    disabled={followUpAnswers[q._id] === undefined}
                                                                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-all"
                                                                >
                                                                    Submit Answer
                                                                </button>
                                                            </div>
                                                        )}
                                                        {followUpResults[q._id] && (
                                                            <div className={`mt-4 p-3 rounded-lg border flex items-center gap-2 ${followUpResults[q._id].isCorrect
                                                                ? 'bg-green-500/10 border-green-500/30'
                                                                : 'bg-red-500/10 border-red-500/30'
                                                                }`}>
                                                                {followUpResults[q._id].isCorrect ? (
                                                                    <><CheckCircle className="h-5 w-5 text-green-400" /><span className="text-green-300 text-sm font-medium">Correct! Great understanding!</span></>
                                                                ) : (
                                                                    <><XCircle className="h-5 w-5 text-red-400" /><span className="text-red-300 text-sm font-medium">Not quite — loading next step...</span></>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* RESOLVED MODE */}
                                                {tutorSessions[q._id].isResolved && (
                                                    <div className="flex flex-col gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="h-5 w-5 text-green-400" />
                                                            <span className="text-green-300 font-semibold">You've got the concept!</span>
                                                        </div>
                                                        <p className="text-sm text-green-200/70 ml-7">
                                                            Great work working through the basics. functionality. Now try to solve the original question again.
                                                        </p>
                                                        <div className="self-end mt-2">
                                                            <button
                                                                onClick={() => {
                                                                    setTutorSessions(prev => ({ ...prev, [q._id]: undefined }));
                                                                    setResults(prev => { const n = { ...prev }; delete n[q._id]; return n; });
                                                                    setSelectedAnswers(prev => { const n = { ...prev }; delete n[q._id]; return n; });
                                                                }}
                                                                className="px-3 py-1.5 text-xs bg-green-900/30 hover:bg-green-900/50 text-green-300 border border-green-800 rounded-lg transition-colors"
                                                            >
                                                                Close Tutor
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })()}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-6">
                        <button
                            onClick={() => setCurrentIndex(prev => prev - 1)}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800/50 border border-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 rounded-xl transition-all"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            Previous
                        </button>

                        <span className="text-gray-400 text-sm">
                            {currentIndex + 1} / {questions.length}
                        </span>

                        <button
                            onClick={() => setCurrentIndex(prev => prev + 1)}
                            disabled={currentIndex === questions.length - 1}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800/50 border border-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 rounded-xl transition-all"
                        >
                            Next
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamQuestions;

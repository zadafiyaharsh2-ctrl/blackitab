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
    Filter
} from 'lucide-react';
import API_URL from '../config';

const ExamQuestions = () => {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [results, setResults] = useState({});
    const [activeSubject, setActiveSubject] = useState('All');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [checkingId, setCheckingId] = useState(null);

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
        } catch (err) {
            console.error('Error checking answer:', err);
        } finally {
            setCheckingId(null);
        }
    };

    const handleAIGenerate = async () => {
        try {
            setGenerating(true);
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API_URL}/api/problems/exam/${examId}/generate`,
                {
                    subject: activeSubject === 'All' ? currentExam.subjects[0] : activeSubject,
                    count: 3,
                    difficulty: 'Medium'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setQuestions(prev => [...res.data.data, ...prev]);
            }
        } catch (err) {
            console.error('Error generating questions:', err);
        } finally {
            setGenerating(false);
        }
    };

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
        <div className="max-w-5xl mx-auto px-4 py-8">
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
                    <button
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
                    </button>
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
                    <button
                        onClick={handleAIGenerate}
                        disabled={generating}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/30"
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Generate Questions
                        </div>
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {questions.map((q, idx) => (
                        <div
                            key={q._id}
                            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 transition-all hover:border-gray-600"
                        >
                            {/* Question Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full">
                                            Q{idx + 1}
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
                                <div className={`p-4 rounded-xl border ${results[q._id].correct
                                        ? 'bg-green-500/10 border-green-500/30'
                                        : 'bg-red-500/10 border-red-500/30'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {results[q._id].correct ? (
                                            <>
                                                <CheckCircle className="h-5 w-5 text-green-400" />
                                                <span className="text-green-400 font-semibold">Correct!</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-5 w-5 text-red-400" />
                                                <span className="text-red-400 font-semibold">Incorrect</span>
                                            </>
                                        )}
                                    </div>
                                    {results[q._id].explanation && (
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {results[q._id].explanation}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExamQuestions;

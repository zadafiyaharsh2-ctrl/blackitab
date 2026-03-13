import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { motion } from 'framer-motion'
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
    Book,
    Maximize
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API_URL from '../../config';

const ExamQuestions = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();

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
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [focusQuestions, setFocusQuestions] = useState([]);
    const [focusIndex, setFocusIndex] = useState(0);
    const [focusSelectedOption, setFocusSelectedOption] = useState();
    const [focusResultIndicator, setFocusResultIndicator] = useState(null); // 'correct' | 'wrong' | null
    const [focusResults, setFocusResults] = useState([]); 
    
    // Adaptive Sequence States
    const [isAdaptiveSequence, setIsAdaptiveSequence] = useState(false);
    const [adaptiveStage, setAdaptiveStage] = useState(0); // Max 8
    const [adaptiveFailedCount, setAdaptiveFailedCount] = useState(0); // Max 3
    const [currentAdaptiveQuestion, setCurrentAdaptiveQuestion] = useState(null);
    const [currentAdaptiveDifficulty, setCurrentAdaptiveDifficulty] = useState(1); // 1: Easy, 2: Medium, 3: Hard
    const [isGeneratingAdaptive, setIsGeneratingAdaptive] = useState(false);

    const [showTheory, setShowTheory] = useState(false);
    const [theoryContent, setTheoryContent] = useState('');
    const [loadingTheory, setLoadingTheory] = useState(false);

    const difficultyMap = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

    const startFocusMode = () => {
        const selectedQuestions = questions.slice(0, 8); // Limit to 8
        setFocusQuestions(selectedQuestions);
        setFocusIndex(0);
        setFocusResults([]);
        setFocusResultIndicator(null);
        setFocusSelectedOption(undefined);
        setIsAdaptiveSequence(false);
        setAdaptiveStage(0);
        setAdaptiveFailedCount(0);
        setCurrentAdaptiveQuestion(null);
        setShowTheory(false);
        setIsFocusMode(true);
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => console.log('Fullscreen failed', err));
        }
    };

    const stopFocusMode = () => {
        setIsFocusMode(false);
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log('Exit fullscreen failed', err));
        }
    };

    const handleFocusSubmit = async () => {
        if (focusSelectedOption === undefined) return;
        const qId = isAdaptiveSequence ? currentAdaptiveQuestion._id : focusQuestions[focusIndex]._id;
        
        try {
            setCheckingId(qId);
            const token = localStorage.getItem('token');
            // Check answer (If it's adaptive, we might just validate client-side since correctAnswer is in the object, but let's be consistent or use local)
            // Wait, for adaptive, `correctAnswer` is strictly local to `currentAdaptiveQuestion`.
            // Let's do local validation for adaptive to save a DB trip since it's not saved in DB anyway.
            let isCorrect = false;
            if (isAdaptiveSequence) {
                isCorrect = focusSelectedOption === currentAdaptiveQuestion.correctAnswer;
                // Wait 500ms for UX
                await new Promise(r => setTimeout(r, 500));
            } else {
                const res = await axios.post(
                    `${API_URL}/api/attempts/submit`,
                    { questionId: qId, selectedOption: focusSelectedOption, timeTakenSeconds: 30 },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data.success) {
                    isCorrect = res.data.isCorrect;
                    setFocusResults(prev => [...prev, { questionId: qId, correct: isCorrect }]);
                }
            }

            setFocusResultIndicator(isCorrect ? 'correct' : 'wrong');

            if (isAdaptiveSequence) {
                if (isCorrect) {
                     setCurrentAdaptiveDifficulty(prev => Math.min(prev + 1, 3));
                } else {
                     setCurrentAdaptiveDifficulty(prev => Math.max(prev - 1, 1));
                     setAdaptiveFailedCount(prev => prev + 1);
                }
            } else {
                if (!isCorrect) {
                    // Start Adaptive Sequence because original was wrong
                    setIsAdaptiveSequence(true);
                    setAdaptiveStage(0);
                    setAdaptiveFailedCount(0);
                    setCurrentAdaptiveDifficulty(1); // Start Easy
                }
            }
        } catch (err) {
            console.error('Check error', err);
        } finally {
            setCheckingId(null);
        }
    };

    const fetchAdaptiveQuestion = async (difficultyDiff) => {
        setIsGeneratingAdaptive(true);
        setCurrentAdaptiveQuestion(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API_URL}/api/problems/exam/${examId}/adaptive-question`,
                { 
                    failedQuestionId: focusQuestions[focusIndex]._id,
                    targetDifficulty: difficultyMap[difficultyDiff]
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setCurrentAdaptiveQuestion(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching adaptive part', err);
            // Fallback if AI fails, just skip adaptive
            setIsAdaptiveSequence(false);
            setFocusIndex(prev => prev + 1);
        } finally {
            setIsGeneratingAdaptive(false);
        }
    };

    const fetchTheory = async () => {
        setShowTheory(true);
        setLoadingTheory(true);
        try {
            const token = localStorage.getItem('token');
            // Just use the current original question for theory
            const failedIds = [focusQuestions[focusIndex]._id];
            const res = await axios.post(
                `${API_URL}/api/problems/exam/${examId}/theory`,
                { failedQuestionIds: failedIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setTheoryContent(res.data.theory);
            }
        } catch (err) {
            setTheoryContent('Failed to load theory summary. Please refer to your textbooks.');
            console.error('Error fetching theory content:', err);
        } finally {
            setLoadingTheory(false);
        }
    }

    const handleFocusNext = async () => {
        setFocusResultIndicator(null);
        setFocusSelectedOption(undefined);

        if (isAdaptiveSequence) {
            const nextStage = adaptiveStage + 1;
            setAdaptiveStage(nextStage);
            
            if (adaptiveFailedCount >= 3) {
                fetchTheory();
            } else if (nextStage >= 8) {
                // Adaptive sequence finished successfully
                setIsAdaptiveSequence(false);
                if (focusIndex < focusQuestions.length - 1) {
                    setFocusIndex(prev => prev + 1);
                } else {
                    stopFocusMode();
                }
            } else {
                // Fetch next adaptive question
                fetchAdaptiveQuestion(currentAdaptiveDifficulty);
            }
        } else {
            // we got it right, move to next original
            if (focusIndex < focusQuestions.length - 1) {
                setFocusIndex(prev => prev + 1);
            } else {
                stopFocusMode();
            }
        }
    };

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
                
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                
                const res = await axios.get(url, config);
                if (res.data.success) {
                    setQuestions(res.data.data);
                    
                    // Pre-fill past attempts
                    const initialResults = {};
                    const initialAnswers = {};
                    
                    res.data.data.forEach(q => {
                        if (q.userAttempt) {
                            initialAnswers[q._id] = q.userAttempt.selectedOption;
                            initialResults[q._id] = {
                                correct: q.userAttempt.isCorrect,
                                ...(q.userAttempt.isCorrect && { correctAnswer: q.userAttempt.selectedOption })
                            };
                        }
                    });
                    
                    setResults(initialResults);
                    setSelectedAnswers(initialAnswers);
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

    const handleReattempt = (questionId) => {
        setResults(prev => {
            const next = { ...prev };
            delete next[questionId];
            return next;
        });
        setSelectedAnswers(prev => {
            const next = { ...prev };
            delete next[questionId];
            return next;
        });
    };
    const handleSubmitAnswer = async (questionId) => {
        const selectedOption = selectedAnswers[questionId];
        if (selectedOption === undefined) return;

        try {
            setCheckingId(questionId);
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API_URL}/api/attempts/submit`,
                { questionId, selectedOption, timeTakenSeconds: 30 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setResults(prev => ({ 
                    ...prev, 
                    [questionId]: { correct: res.data.isCorrect, correctAnswer: res.data.correctAnswer } 
                }));
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
                ? isDark ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-purple-500 bg-purple-50 text-purple-900'
                : isDark ? 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-gray-500 hover:bg-gray-700/30' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50';
        }

        if (optionIndex === result.correctAnswer) {
            return isDark ? 'border-green-500 bg-green-500/20 text-green-300' : 'border-green-500 bg-green-100 text-green-800';
        }
        if (isSelected && !result.correct) {
            return isDark ? 'border-red-500 bg-red-500/20 text-red-300' : 'border-red-500 bg-red-100 text-red-800';
        }
        return isDark ? 'border-gray-700/50 bg-gray-800/20 text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-400';
    };

    if (isFocusMode) {
        const q = focusQuestions[focusIndex];
        return (
            <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center p-4">
                <button 
                   onClick={stopFocusMode} 
                   className="absolute top-6 right-8 text-gray-500 hover:text-red-400 font-bold text-sm bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 transition-colors"
                >
                   Exit Exam Mode
                </button>

                <div className="w-full max-w-3xl">
                    {showTheory ? (
                        <div className="bg-gray-800 p-8 rounded-2xl border border-blue-500/50 shadow-2xl shadow-blue-900/20">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                <Book className="h-6 w-6 text-blue-400" />
                                Study Review Session
                            </h2>
                            <p className="text-gray-400 mb-6 font-medium">You missed 3 or more questions. Review these core concepts before continuing.</p>
                            
                            {loadingTheory ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
                                    <p className="text-blue-300">AI Tutor is compiling your tailored study guide...</p>
                                </div>
                            ) : (
                                <div className="prose prose-invert max-w-none text-gray-300 max-h-[50vh] overflow-y-auto pr-4 mb-8 bg-gray-900/50 p-6 rounded-xl border border-gray-700/50">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{theoryContent}</ReactMarkdown>
                                </div>
                            )}
                            
                            {!loadingTheory && (
                                <button onClick={stopFocusMode} className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-600/30">
                                    Finish Review & Exit
                                </button>
                            )}
                        </div>
                    ) : isGeneratingAdaptive ? (
                        <div className="bg-gray-800 flex flex-col items-center justify-center py-20 px-8 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/20">
                            <BrainCircuit className="h-16 w-16 text-purple-400 mb-6 animate-pulse" />
                            <h2 className="text-2xl font-bold text-white mb-2">Generating Adaptive Question...</h2>
                            <p className="text-gray-400 font-medium">Adjusting difficulty based on your previous answers.</p>
                            <div className="mt-8 flex gap-2">
                                <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-800 p-8 flex flex-col rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/20 transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <span className="px-4 py-1.5 bg-purple-500/20 text-purple-300 font-bold rounded-full border border-purple-500/30">
                                    {isAdaptiveSequence ? `Adaptive Q${adaptiveStage}` : `Question ${focusIndex + 1} of ${focusQuestions.length}`}
                                </span>
                                <div className="flex gap-2 items-center">
                                    {isAdaptiveSequence && (
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${currentAdaptiveDifficulty === 1 ? 'border-green-500/50 text-green-400 bg-green-500/10' : currentAdaptiveDifficulty === 2 ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}`}>
                                            Diff: {difficultyMap[currentAdaptiveDifficulty]}
                                        </span>
                                    )}
                                    <span className="text-gray-400 text-sm font-medium">Exam Mode Strict</span>
                                </div>
                            </div>

                            <p className="text-white text-2xl font-medium leading-relaxed mb-8">
                                {isAdaptiveSequence && currentAdaptiveQuestion ? currentAdaptiveQuestion.question : q.question}
                            </p>

                            <div className="space-y-4 mb-8">
                                {(isAdaptiveSequence && currentAdaptiveQuestion ? currentAdaptiveQuestion.options : q.options).map((opt, i) => {
                                    const isSelected = focusSelectedOption === i;
                                    let optionStyle = 'border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50';
                                    
                                    if (focusResultIndicator) {
                                        if (isSelected && focusResultIndicator === 'correct') {
                                            optionStyle = 'border-green-500 bg-green-500/20 text-green-300 cursor-default';
                                        } else if (isSelected && focusResultIndicator === 'wrong') {
                                            optionStyle = 'border-red-500 bg-red-500/20 text-red-300 cursor-default';
                                        } else {
                                            optionStyle = 'border-gray-700/50 bg-gray-800/50 text-gray-500 cursor-default opacity-50';
                                        }
                                    } else if (isSelected) {
                                        optionStyle = 'border-purple-500 bg-purple-500/20 text-white shadow-lg shadow-purple-900/20';
                                    }

                                    return (
                                        <button 
                                            key={i}
                                            onClick={() => !focusResultIndicator && setFocusSelectedOption(i)}
                                            disabled={focusResultIndicator !== null}
                                            className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${optionStyle} ${focusResultIndicator && isAdaptiveSequence && currentAdaptiveQuestion && currentAdaptiveQuestion.correctAnswer === i ? '!border-green-500/80 !border-dashed' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className={`w-8 h-8 flex items-center justify-center rounded-full border ${isSelected && !focusResultIndicator ? 'border-purple-400 text-purple-300' : 'border-gray-600 text-gray-500'}`}>
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                <span className="text-lg">{opt}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {!focusResultIndicator ? (
                                <button
                                    onClick={handleFocusSubmit}
                                    disabled={focusSelectedOption === undefined || checkingId !== null}
                                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold text-lg rounded-xl transition-all"
                                >
                                    {checkingId !== null ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 'Lock Answer'}
                                </button>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between mt-4">
                                    <div className="flex-1 flex items-center gap-3 px-6 py-4 rounded-xl border bg-gray-900 border-gray-700">
                                        {focusResultIndicator === 'correct' ? <CheckCircle className="h-6 w-6 text-green-400" /> : <XCircle className="h-6 w-6 text-red-400" />}
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-lg ${focusResultIndicator === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{focusResultIndicator === 'correct' ? 'Correct!' : 'Incorrect'}</span>
                                            {focusResultIndicator === 'wrong' && !isAdaptiveSequence && (
                                                <span className="text-gray-400 text-sm">Initiating adaptive sequence...</span>
                                            )}
                                            {isAdaptiveSequence && (
                                                <span className="text-gray-400 text-sm">{focusResultIndicator === 'correct' ? 'Difficulty increasing ↑' : 'Difficulty decreasing ↓'}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleFocusNext}
                                        className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 hover:bg-gray-200 font-bold text-lg rounded-xl transition-all whitespace-nowrap"
                                    >
                                        {(isAdaptiveSequence && adaptiveStage < 8 && adaptiveFailedCount < (focusResultIndicator === 'wrong' ? 3 : 4)) ? (
                                            focusResultIndicator === 'wrong' && adaptiveStage === 0 ? 'Start Adaptive Flow' : 'Next Adaptive'
                                        ) : (
                                            focusIndex < focusQuestions.length - 1 ? 'Next Original Question' : 'Finish Exam'
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 relative">
            {/* Analyzing Overlay */}
            {analyzing && (
                <div className="fixed inset-0 z-50 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-purple-200 dark:border-purple-500/50 flex flex-col items-center max-w-sm text-center shadow-2xl shadow-purple-500/20">
                        <Loader2 className="h-12 w-12 text-purple-600 dark:text-purple-400 animate-spin mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Agent Analyzing...</h3>
                        <p className="text-gray-600 dark:text-gray-400">Identifying your learning gap and preparing a remedial step.</p>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/problems')}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-4"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Exams
                </button>

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            {currentExam.name}{' '}
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-500 text-transparent bg-clip-text">
                                Practice
                            </span>
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {questions.length} question{questions.length !== 1 ? 's' : ''} available
                        </p>
                    </div>

                    {/* Focus Mode Button */}
                    {questions.length > 0 && (
                        <button
                            onClick={startFocusMode}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/30"
                        >
                            <Maximize className="h-5 w-5" />
                            Start Exam Mode
                        </button>
                    )}
                </div>
            </div>

            {/* Subject Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                <button
                    onClick={() => setActiveSubject('All')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSubject === 'All'
                        ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/50'
                        : 'bg-white dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
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
                            ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/50'
                            : 'bg-white dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
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
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No questions found for this exam yet.</p>
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
                <motion.div initial="hidden" animate="visible">
                    {(() => {
                        const q = questions[currentIndex];
                        return (
                            <div
                                key={q._id}
                                className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all shadow-sm dark:shadow-none"
                            >
                                {/* Question Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                                                Q{currentIndex + 1} of {questions.length}
                                            </span>
                                            {q.subject && (
                                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                                    {q.subject}
                                                </span>
                                            )}
                                            {q.difficulty && (
                                                <span className={`px-3 py-1 text-xs rounded-full ${q.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                                                    q.difficulty === 'Hard' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                                                        'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                                                    }`}>
                                                    {q.difficulty}
                                                </span>
                                            )}
                                            {q.isAIGenerated && (
                                                <span className="px-3 py-1 bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 text-xs rounded-full flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" /> AI
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-900 dark:text-white text-lg font-medium leading-relaxed">
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
                                            ? 'bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/30'
                                            : 'bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
                                            }`}>
                                            <div className="flex items-center gap-2">
                                                {results[q._id].correct ? (
                                                    <>
                                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                        <span className="text-green-700 dark:text-green-400 font-semibold">Correct!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                        <span className="text-red-700 dark:text-red-400 font-semibold">Not quite right</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Button: Reattempt (Manual Trigger) */}
                                        {!results[q._id].correct && (
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => handleReattempt(q._id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 hover:bg-gray-700 text-gray-300 rounded-lg transition-all"
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                    Reattempt Question
                                                </button>
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
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 rounded-xl transition-all"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            Previous
                        </button>

                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {currentIndex + 1} / {questions.length}
                        </span>

                        <button
                            onClick={() => setCurrentIndex(prev => prev + 1)}
                            disabled={currentIndex === questions.length - 1}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 rounded-xl transition-all"
                        >
                            Next
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ExamQuestions;

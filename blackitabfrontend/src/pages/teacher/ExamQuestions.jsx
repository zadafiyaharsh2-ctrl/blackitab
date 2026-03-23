import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    AlertTriangle,
    Sparkles,
    Loader2,
    BookOpen,
    Filter,
    Maximize
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API_URL from '../../config';
import FocusModeOverlay from '../../components/teacher/pages/examQuestions/FocusModeOverlay';
import QuestionCard from '../../components/teacher/pages/examQuestions/QuestionCard';

const ExamQuestions = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark } = useTheme();

    const isInstituteMode = location.pathname.endsWith('/institute');

    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [results, setResults] = useState({});
    const [activeSubject, setActiveSubject] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get('subject') || 'All';
    });
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [checkingId, setCheckingId] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [tutorSessions, setTutorSessions] = useState({});
    const [followUpAnswers, setFollowUpAnswers] = useState({});
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [focusQuestions, setFocusQuestions] = useState([]);
    const [focusIndex, setFocusIndex] = useState(0);
    const [focusSelectedOption, setFocusSelectedOption] = useState();
    const [focusResultIndicator, setFocusResultIndicator] = useState(null);
    const [focusResults, setFocusResults] = useState([]); 
    
    const [isAdaptiveSequence, setIsAdaptiveSequence] = useState(false);
    const [adaptiveStage, setAdaptiveStage] = useState(0);
    const [adaptiveFailedCount, setAdaptiveFailedCount] = useState(0);
    const [currentAdaptiveQuestion, setCurrentAdaptiveQuestion] = useState(null);
    const [currentAdaptiveDifficulty, setCurrentAdaptiveDifficulty] = useState(1);
    const [isGeneratingAdaptive, setIsGeneratingAdaptive] = useState(false);

    const [showTheory, setShowTheory] = useState(false);
    const [theoryContent, setTheoryContent] = useState('');
    const [loadingTheory, setLoadingTheory] = useState(false);
    const [subjectHealth, setSubjectHealth] = useState(null);
    const [decayedDomains, setDecayedDomains] = useState(0);
    const [dynamicSubjects, setDynamicSubjects] = useState([]);

    const difficultyMap = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

    const formatInactivityLabel = (days) => {
        if (!Number.isFinite(days) || days <= 0) return 'today';
        if (days === 1) return '1 day';
        return `${days} days`;
    };

    const startFocusMode = () => {
        const selectedQuestions = questions.slice(0, 8);
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
            let isCorrect = false;
            if (isAdaptiveSequence) {
                isCorrect = focusSelectedOption === currentAdaptiveQuestion.correctAnswer;
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
                    setIsAdaptiveSequence(true);
                    setAdaptiveStage(0);
                    setAdaptiveFailedCount(0);
                    setCurrentAdaptiveDifficulty(1);
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
                setIsAdaptiveSequence(false);
                if (focusIndex < focusQuestions.length - 1) {
                    setFocusIndex(prev => prev + 1);
                } else {
                    stopFocusMode();
                }
            } else {
                fetchAdaptiveQuestion(currentAdaptiveDifficulty);
            }
        } else {
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
    const subjectsToShow = Array.from(new Set([...dynamicSubjects, activeSubject !== 'All' ? activeSubject : null].filter(Boolean)));

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const sourceParam = isInstituteMode ? 'institute' : 'global';
                const baseUrl = `${API_URL}/api/problems/exam/${examId}/questions`;
                const params = new URLSearchParams({ source: sourceParam });
                if (activeSubject !== 'All') params.append('subject', activeSubject);
                const url = `${baseUrl}?${params.toString()}`;
                
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                
                const res = await axios.get(url, config);
                if (res.data.success) {
                    setQuestions(res.data.data);
                    
                    if (activeSubject === 'All') {
                         const fetchedSubjects = Array.from(new Set(res.data.data.map(q => q.subject).filter(Boolean)));
                         setDynamicSubjects(fetchedSubjects);
                    }
                    
                    const responseMeta = res.data.meta || {};
                    setSubjectHealth(responseMeta.subjectHealth || null);
                    setDecayedDomains(Number.isFinite(Number(responseMeta.decayedDomains)) ? Number(responseMeta.decayedDomains) : 0);
                    
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
                setSubjectHealth(null);
                setDecayedDomains(0);
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
        } catch (err) {
            console.error('Error checking answer:', err);
        } finally {
            setCheckingId(null);
        }
    };

    // Focus Mode Overlay
    if (isFocusMode) {
        return (
            <FocusModeOverlay
                focusQuestions={focusQuestions}
                focusIndex={focusIndex}
                focusSelectedOption={focusSelectedOption}
                setFocusSelectedOption={setFocusSelectedOption}
                focusResultIndicator={focusResultIndicator}
                isAdaptiveSequence={isAdaptiveSequence}
                adaptiveStage={adaptiveStage}
                adaptiveFailedCount={adaptiveFailedCount}
                currentAdaptiveQuestion={currentAdaptiveQuestion}
                currentAdaptiveDifficulty={currentAdaptiveDifficulty}
                isGeneratingAdaptive={isGeneratingAdaptive}
                showTheory={showTheory}
                loadingTheory={loadingTheory}
                theoryContent={theoryContent}
                checkingId={checkingId}
                handleFocusSubmit={handleFocusSubmit}
                handleFocusNext={handleFocusNext}
                stopFocusMode={stopFocusMode}
            />
        );
    }

    return (
        <div className="min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white transition-colors duration-300 pt-8 pb-16">
            <div className="max-w-5xl mx-auto px-4 relative">
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
                    {isInstituteMode ? 'Back to Institute Questions' : 'Back to Exams'}
                </button>

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            {currentExam.name}{' '}
                            <span className={`bg-gradient-to-r ${isInstituteMode ? 'from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400' : 'from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-500'} text-transparent bg-clip-text`}>
                                {isInstituteMode ? 'Institute Practice' : 'Practice'}
                            </span>
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {questions.length} question{questions.length !== 1 ? 's' : ''} available
                        </p>
                        {subjectHealth?.effectiveElo && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Adaptive target Elo: {subjectHealth.effectiveElo}
                                {subjectHealth.domainName ? ` in ${subjectHealth.domainName}` : ''}
                                {activeSubject === 'All' && decayedDomains > 1 ? ` • ${decayedDomains} domains currently decaying` : ''}
                            </p>
                        )}
                    </div>

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
                {subjectsToShow.map((subject) => (
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

            {subjectHealth && subjectHealth.status !== 'healthy' && (
                <div className={`mb-6 rounded-xl border px-4 py-3 ${isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold">Subject Health Alert</p>
                            <p className="text-xs mt-1 leading-relaxed">
                                {subjectHealth.message || `Your ${subjectHealth.domainName || activeSubject} mastery is decaying. Solve ${subjectHealth.recoveryProblemsTarget || 2} problems today to recover toward Elo ${subjectHealth.storedElo || 1000}.`}
                            </p>
                            <p className="text-[11px] mt-1 opacity-90">
                                Effective Elo {subjectHealth.effectiveElo || 1000}
                                {subjectHealth.storedElo ? ` (stored ${subjectHealth.storedElo})` : ''}
                                {Number.isFinite(subjectHealth.inactivityDays) ? ` after ${formatInactivityLabel(subjectHealth.inactivityDays)} inactive.` : ''}
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
                </div>
            ) : (
                <motion.div initial="hidden" animate="visible">
                    <QuestionCard
                        question={questions[currentIndex]}
                        currentIndex={currentIndex}
                        totalQuestions={questions.length}
                        selectedAnswer={selectedAnswers[questions[currentIndex]._id]}
                        result={results[questions[currentIndex]._id]}
                        checkingId={checkingId}
                        onSelectOption={handleSelectOption}
                        onSubmitAnswer={handleSubmitAnswer}
                        onReattempt={handleReattempt}
                        onPrev={() => setCurrentIndex(prev => prev - 1)}
                        onNext={() => setCurrentIndex(prev => prev + 1)}
                    />
                </motion.div>
            )}
        </div>
        </div>
    );
};

export default ExamQuestions;

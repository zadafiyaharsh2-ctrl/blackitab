import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaGraduationCap, FaTrophy, FaBook, FaArrowRight, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../config';
import usePageTitle from '../../hooks/usePageTitle';

const STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to Blackitab! 🎉',
        subtitle: "You're all set. Let's show you what's possible.",
        content: null,
    },
    {
        id: 'goals',
        title: "What's your main goal?",
        subtitle: 'Pick one to personalize your experience.',
        content: 'goals',
    },
    {
        id: 'exam',
        title: 'Which exam are you preparing for?',
        subtitle: "We'll highlight relevant content for you.",
        content: 'exam',
    },
    {
        id: 'done',
        title: "You're ready! 🚀",
        subtitle: 'Your setup is complete. Explore the platform now.',
        content: null,
    },
];

const GOALS = [
    { id: 'exam-prep', label: 'Exam Preparation', icon: '📚', desc: 'JEE, NEET, UPSC, CAT, GATE' },
    { id: 'skill-build', label: 'Skill Building', icon: '💡', desc: 'Programming, DSA, problem solving' },
    { id: 'content-create', label: 'Content Creation', icon: '🎬', desc: 'Share knowledge and build an audience' },
    { id: 'explore', label: 'Just Exploring', icon: '🌐', desc: 'See what Blackitab has to offer' },
];

const EXAMS = [
    { id: 'jee', label: 'JEE', icon: '⚗️' },
    { id: 'neet', label: 'NEET', icon: '🔬' },
    { id: 'upsc', label: 'UPSC', icon: '🏛️' },
    { id: 'gate', label: 'GATE', icon: '⚙️' },
    { id: 'cat', label: 'CAT', icon: '💼' },
    { id: 'other', label: 'Other / All', icon: '📖' },
];

const FEATURES = [
    { icon: <FaRobot className="text-purple-400" />, title: 'Ask AI', desc: 'Get instant answers to any study question' },
    { icon: <FaBook className="text-blue-400" />, title: 'Study Content', desc: 'Browse videos and notes from top creators' },
    { icon: <FaTrophy className="text-yellow-400" />, title: 'Leaderboard', desc: 'Compete with peers and top the rankings' },
    { icon: <FaGraduationCap className="text-green-400" />, title: 'Practice Problems', desc: 'Solve exam-level questions with solutions' },
];

const Onboarding = () => {
    usePageTitle('Getting Started');
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);
    const [saving, setSaving] = useState(false);

    const currentStep = STEPS[step];
    const isLast = step === STEPS.length - 1;

    const handleNext = async () => {
        if (isLast) {
            // Mark onboarding as done
            localStorage.setItem('onboarding_done', 'true');
            navigate('/dashboard');
            return;
        }
        // On the exam step, optionally save a bio hint to backend
        if (currentStep.id === 'exam' && selectedExam) {
            try {
                setSaving(true);
                const token = localStorage.getItem('token');
                const bioHint = `Preparing for ${selectedExam.toUpperCase()}`;
                await axios.put(`${API_URL}/api/user/update-profile`, { bio: bioHint }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch { }
            setSaving(false);
        }
        setStep(s => s + 1);
    };

    const canProceed = () => {
        if (currentStep.content === 'goals') return !!selectedGoal;
        if (currentStep.content === 'exam') return !!selectedExam;
        return true;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
            {/* Progress dots */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 flex gap-2">
                {STEPS.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-blue-500' : i < step ? 'w-4 bg-blue-500/50' : 'w-4 bg-gray-300 dark:bg-gray-700'}`}
                    />
                ))}
            </div>

            <div className="w-full max-w-lg">
                {/* Card */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-8 md:p-10">

                    {/* Step: welcome */}
                    {currentStep.id === 'welcome' && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                                <span className="text-4xl">🎓</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{currentStep.title}</h1>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">{currentStep.subtitle}</p>
                            <div className="grid grid-cols-2 gap-3 text-left mb-2">
                                {FEATURES.map(f => (
                                    <div key={f.title} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                                        <span className="text-xl mt-0.5">{f.icon}</span>
                                        <div>
                                            <p className="text-gray-900 dark:text-white font-semibold text-sm">{f.title}</p>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs leading-snug">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step: goals */}
                    {currentStep.id === 'goals' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{currentStep.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">{currentStep.subtitle}</p>
                            <div className="space-y-3">
                                {GOALS.map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => setSelectedGoal(g.id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${selectedGoal === g.id
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-white/5'
                                            }`}
                                    >
                                        <span className="text-2xl">{g.icon}</span>
                                        <div className="flex-1">
                                            <p className={`font-semibold ${selectedGoal === g.id ? 'text-blue-400' : 'text-gray-900 dark:text-white'}`}>{g.label}</p>
                                            <p className="text-gray-400 text-sm">{g.desc}</p>
                                        </div>
                                        {selectedGoal === g.id && <FaCheck className="text-blue-400 flex-shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step: exam */}
                    {currentStep.id === 'exam' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{currentStep.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">{currentStep.subtitle}</p>
                            <div className="grid grid-cols-3 gap-3">
                                {EXAMS.map(e => (
                                    <button
                                        key={e.id}
                                        onClick={() => setSelectedExam(e.id)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all ${selectedExam === e.id
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-white/5'
                                            }`}
                                    >
                                        <span className="text-3xl">{e.icon}</span>
                                        <span className={`font-bold text-sm ${selectedExam === e.id ? 'text-blue-400' : 'text-gray-900 dark:text-white'}`}>{e.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step: done */}
                    {currentStep.id === 'done' && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                                <FaCheck className="text-white text-3xl" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{currentStep.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">{currentStep.subtitle}</p>
                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 p-5 text-left space-y-2 mb-2">
                                {selectedGoal && <p className="text-sm text-gray-700 dark:text-gray-300">✅ Goal: <span className="font-semibold text-gray-900 dark:text-white">{GOALS.find(g => g.id === selectedGoal)?.label}</span></p>}
                                {selectedExam && <p className="text-sm text-gray-700 dark:text-gray-300">✅ Exam: <span className="font-semibold text-gray-900 dark:text-white">{selectedExam.toUpperCase()}</span></p>}
                                <p className="text-sm text-gray-700 dark:text-gray-300">✅ Profile created</p>
                            </div>
                        </div>
                    )}

                    {/* CTA Button */}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed() || saving}
                        className={`w-full mt-8 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${canProceed() && !saving
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {saving ? 'Saving...' : isLast ? 'Go to Dashboard' : 'Continue'}
                        {!saving && <FaArrowRight className="text-sm" />}
                    </button>

                    {/* Skip */}
                    {!isLast && (
                        <button
                            onClick={() => { localStorage.setItem('onboarding_done', 'true'); navigate('/dashboard'); }}
                            className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            Skip setup
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;

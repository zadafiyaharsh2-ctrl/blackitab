const Attempt = require('../../models/Attempt');
const ExamQuestion = require('../../models/ExamQuestion');
const User = require('../../models/User');
const {
    BASE_ELO,
    toMap,
    normalizeDomainKey,
    prettifyDomainName,
    getDomainDecaySnapshot,
    getDecayConfig,
} = require('../../services/eloDecayService');

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// POST /api/attempts/submit
exports.submitAttempt = async (req, res) => {
    try {
        const { questionId, selectedOption, timeTakenSeconds } = req.body;
        const userId = req.user._id;

        const question = await ExamQuestion.findById(questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const isCorrect = (question.correctAnswer === selectedOption);

        // 1. Create Attempt Record
        const attempt = new Attempt({
            userId,
            questionId,
            selectedOption,
            isCorrect,
            timeTakenSeconds: timeTakenSeconds || 0
        });
        await attempt.save();

        // 5. Fetch User for Gamification & Elo calculations
        const user = await User.findById(userId);

        // --- ELO RATING SYSTEM ---
        const subjectFromQuestion = typeof question.subject === 'string' ? question.subject.trim() : '';
        const domainName = subjectFromQuestion;

        let questionUpdateQuery = {
            $inc: {
                totalAttempts: 1,
                successfulAttempts: isCorrect ? 1 : 0
            }
        };

        let ratingUpdate = null;

        if (domainName) {
            const domainKey = normalizeDomainKey(domainName);
            const R_B = Number.isFinite(Number(question.eloRating)) ? Number(question.eloRating) : BASE_ELO;
            const domainRatingsMap = toMap(user.domainRatings);
            const domainLastAttemptedMap = toMap(user.domainLastAttemptedAt);
            const domainDecay = getDomainDecaySnapshot({
                domainName,
                domainRatings: domainRatingsMap,
                domainLastAttemptedAt: domainLastAttemptedMap,
                fallbackLastAttemptedAt: user.lastActiveDate,
            });

            // Use effective (time-decayed) Elo for expected score calculations.
            const R_A = domainDecay.effectiveEloRaw;

            const K = 32;
            const E_A = 1 / (1 + Math.pow(10, (R_B - R_A) / 400));
            const E_B = 1 / (1 + Math.pow(10, (R_A - R_B) / 400));

            const S_A = isCorrect ? 1 : 0;
            const S_B = isCorrect ? 0 : 1;

            const new_R_A = Math.round(R_A + K * (S_A - E_A));
            const new_R_B = Math.round(R_B + K * (S_B - E_B));

            // Update user's domain map
            domainRatingsMap.set(domainKey, new_R_A);
            domainLastAttemptedMap.set(domainKey, new Date());
            user.domainRatings = domainRatingsMap;
            user.domainLastAttemptedAt = domainLastAttemptedMap;
            
            // Add new Elo to question update payload
            questionUpdateQuery.$set = { eloRating: new_R_B };

            ratingUpdate = {
                domain: domainDecay.domainName,
                storedEloBefore: domainDecay.storedElo,
                effectiveEloBefore: Math.round(domainDecay.effectiveEloRaw),
                inactivityDays: domainDecay.inactivityDays,
                eloLossBeforeAttempt: domainDecay.eloLoss,
                updatedElo: new_R_A,
            };
        }

        // 2. Update Question Global Stats & Elo Updates
        await ExamQuestion.findByIdAndUpdate(questionId, questionUpdateQuery, { runValidators: true, context: 'query' });

        // Update User Gamification — Difficulty-weighted Points & 10 XP per correct question
        let newStreak = user.streak || 0;
        let newLongestStreak = user.longestStreak || 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user.lastActiveDate) {
            const lastActive = new Date(user.lastActiveDate);
            lastActive.setHours(0, 0, 0, 0);
            const diffDays = Math.round((today - lastActive) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                newStreak += 1;
            } else if (diffDays > 1) {
                newStreak = 1;
            } else if (diffDays === 0 && newStreak === 0) {
                newStreak = 1;
            }
        } else {
            newStreak = 1;
        }
        newLongestStreak = Math.max(newStreak, newLongestStreak);

        const updateData = {
            streak: newStreak,
            longestStreak: newLongestStreak,
            lastActiveDate: new Date(),
            domainRatings: user.domainRatings,
            domainLastAttemptedAt: user.domainLastAttemptedAt,
        };

        if (isCorrect) {
            // Check if user has already solved this question correctly before
            // We must exclude the attempt we just created
            const previousSuccess = await Attempt.findOne({
                userId,
                questionId,
                isCorrect: true,
                _id: { $ne: attempt._id }
            });

            if (!previousSuccess) {
                const XP_BY_DIFFICULTY = { 'Easy': 5, 'Medium': 15, 'Hard': 30 };
                const pointsGain = XP_BY_DIFFICULTY[question.difficulty] || 10;
                updateData.$inc = { points: pointsGain, xp: 10 };
            }
        }

        await User.findByIdAndUpdate(userId, updateData);

        res.json({
            success: true,
            isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            ratingUpdate,
        });

    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/attempts/analytics
exports.getDashboardAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        // Fetch all attempts for accuracy and stats
        const allAttempts = await Attempt.find({ userId }).populate('questionId').sort({ attemptedAt: -1 }).lean();
        
        const totalAttempts = allAttempts.length;
        const correctAttempts = allAttempts.filter(a => a.isCorrect);
        
        // Calculate unique problems solved
        const uniqueSolvedIds = new Set(
            allAttempts
                .filter(a => a.isCorrect && a.questionId)
                .map(a => a.questionId._id.toString())
        );
        const problemsSolved = uniqueSolvedIds.size;
        
        const accuracy = totalAttempts > 0 ? (correctAttempts.length / totalAttempts) * 100 : null;
        const studySeconds = allAttempts.reduce((acc, curr) => acc + (curr.timeTakenSeconds || 0), 0);
        const studyHours = studySeconds > 0 ? (studySeconds / 3600) : 0;
        const studyMinutes = Math.round(studySeconds / 60);

        const stats = {
            problemsSolved,
            problemsChange: 0,
            accuracy: accuracy !== null ? Math.round(accuracy * 10) / 10 : null,
            accuracyChange: 0,
            currentStreak: user.streak || 0,
            streakChange: 0,
            studyHours: Math.round(studyHours * 10) / 10,
            studyMinutes,
            hoursChange: 0
        };

        // Domain mastery is calculated with time-decayed effective Elo per subject.
        const subjectPerformance = new Map();
        allAttempts.forEach((a) => {
            const question = a.questionId;
            if (!question) return;

            const subjectFromQuestion = typeof question.subject === 'string' ? question.subject.trim() : '';
            const domainName = subjectFromQuestion;
            const domainKey = normalizeDomainKey(domainName);
            if (!domainKey) return;

            if (!subjectPerformance.has(domainKey)) {
                subjectPerformance.set(domainKey, {
                    key: domainKey,
                    name: domainName,
                    total: 0,
                    correct: 0,
                });
            }

            const perf = subjectPerformance.get(domainKey);
            perf.total += 1;
            if (a.isCorrect) perf.correct += 1;
        });

        const domainRatingsMap = toMap(user.domainRatings);
        const domainLastAttemptedMap = toMap(user.domainLastAttemptedAt);

        for (const key of domainRatingsMap.keys()) {
            const normalizedKey = normalizeDomainKey(key);
            if (!normalizedKey) continue;

            if (!subjectPerformance.has(normalizedKey)) {
                subjectPerformance.set(normalizedKey, {
                    key: normalizedKey,
                    name: prettifyDomainName(normalizedKey),
                    total: 0,
                    correct: 0,
                });
            }
        }

        for (const key of domainLastAttemptedMap.keys()) {
            const normalizedKey = normalizeDomainKey(key);
            if (!normalizedKey) continue;

            if (!subjectPerformance.has(normalizedKey)) {
                subjectPerformance.set(normalizedKey, {
                    key: normalizedKey,
                    name: prettifyDomainName(normalizedKey),
                    total: 0,
                    correct: 0,
                });
            }
        }

        const subjectScores = Array.from(subjectPerformance.values())
            .map((perf) => {
                const domainDecay = getDomainDecaySnapshot({
                    domainName: perf.name,
                    domainRatings: domainRatingsMap,
                    domainLastAttemptedAt: domainLastAttemptedMap,
                    fallbackLastAttemptedAt: user.lastActiveDate,
                });

                const elo = domainDecay.effectiveElo;

                // Scale Elo to a 0-100 logic (1000 Elo = 50%, 1600 Elo = 80%) for progress bar graphic
                const prog = clamp(Math.round(elo / 20), 0, 100);
                const accuracyPct = perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0;
                const blendedScore = perf.total > 0
                    ? Math.round((accuracyPct * 0.7) + (prog * 0.3))
                    : prog;

                return {
                    key: perf.key,
                    name: domainDecay.domainName,
                    progress: prog,
                    elo,
                    effectiveElo: domainDecay.effectiveElo,
                    storedElo: domainDecay.storedElo,
                    eloLoss: domainDecay.eloLoss,
                    inactivityDays: domainDecay.inactivityDays,
                    lastAttemptedAt: domainDecay.lastAttemptedAt,
                    decayStatus: domainDecay.status,
                    decayMessage: domainDecay.message,
                    recoveryProblemsTarget: domainDecay.recoveryProblemsTarget,
                    attempts: perf.total,
                    accuracy: accuracyPct,
                    blendedScore,
                    mastery: elo >= 1400 ? 'Advanced' : elo >= 1000 ? 'Intermediate' : 'Beginner',
                    color:
                        elo >= 1400
                            ? 'from-purple-500 to-indigo-600'
                            : elo >= 1000
                                ? 'from-blue-500 to-cyan-600'
                                : 'from-pink-500 to-rose-600',
                };
            })
            .filter((entry) => entry.attempts > 0 || entry.storedElo !== BASE_ELO || entry.inactivityDays > 0)
            .sort((a, b) => {
                if (b.blendedScore !== a.blendedScore) return b.blendedScore - a.blendedScore;
                if (b.attempts !== a.attempts) return b.attempts - a.attempts;
                return b.elo - a.elo;
            });

        const subjectProgress = subjectScores.slice(0, 6);
        const subjectHealthSummary = {
            decayingCount: subjectScores.filter((s) => s.decayStatus !== 'healthy').length,
            criticalCount: subjectScores.filter((s) => s.decayStatus === 'critical').length,
        };

        // Core strengths should represent consistent performance, not one lucky attempt.
        const strengthPool = subjectScores
            .filter((s) => s.attempts >= 3 && (s.accuracy >= 70 || s.blendedScore >= 72))
            .sort((a, b) => {
                if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
                if (b.attempts !== a.attempts) return b.attempts - a.attempts;
                return b.blendedScore - a.blendedScore;
            });

        const strengths = [];
        for (const item of strengthPool) {
            if (!strengths.includes(item.name)) strengths.push(item.name);
            if (strengths.length === 5) break;
        }

        if (strengths.length < 3) {
            const fallbackStrengths = subjectScores
                .filter((s) => s.attempts >= 2 && s.blendedScore >= 65)
                .sort((a, b) => {
                    if (b.blendedScore !== a.blendedScore) return b.blendedScore - a.blendedScore;
                    return b.accuracy - a.accuracy;
                });

            for (const item of fallbackStrengths) {
                if (!strengths.includes(item.name)) strengths.push(item.name);
                if (strengths.length === 5) break;
            }
        }

        // Build weak topics from problems the user actually attempted.
        const topicPerformanceMap = new Map();
        allAttempts.forEach((attemptItem) => {
            const question = attemptItem.questionId;
            if (!question) return;

            const topicCandidates = [];
            if (Array.isArray(question.tags) && question.tags.length > 0) {
                topicCandidates.push(...question.tags);
            }

            const subjectName = typeof question.subject === 'string' ? question.subject.trim() : '';
            if (subjectName) topicCandidates.push(subjectName);

            if (!topicCandidates.length && question.topicId) {
                topicCandidates.push(String(question.topicId));
            }

            const seenTopicKeys = new Set();
            topicCandidates.forEach((topicRaw) => {
                const topicName = String(topicRaw || '').trim();
                if (!topicName) return;

                const key = topicName.toLowerCase();
                if (seenTopicKeys.has(key)) return;
                seenTopicKeys.add(key);

                if (!topicPerformanceMap.has(key)) {
                    topicPerformanceMap.set(key, {
                        name: topicName,
                        total: 0,
                        correct: 0,
                    });
                }

                const topicPerf = topicPerformanceMap.get(key);
                topicPerf.total += 1;
                if (attemptItem.isCorrect) topicPerf.correct += 1;
            });
        });

        const topicStats = Array.from(topicPerformanceMap.values())
            .filter((topic) => topic.total >= 2)
            .map((topic) => {
                const accuracy = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0;
                const weaknessScore = Math.round(((100 - accuracy) * 0.75) + Math.min(topic.total * 4, 25));
                return {
                    ...topic,
                    accuracy,
                    weaknessScore,
                };
            });

        const weakTopicPool = topicStats
            .filter((topic) => topic.accuracy < 65)
            .sort((a, b) => {
                if (b.weaknessScore !== a.weaknessScore) return b.weaknessScore - a.weaknessScore;
                if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
                return b.total - a.total;
            });

        const focusAreas = [];
        for (const topic of weakTopicPool) {
            if (!strengths.includes(topic.name) && !focusAreas.includes(topic.name)) {
                focusAreas.push(topic.name);
            }
            if (focusAreas.length === 5) break;
        }

        if (focusAreas.length < 2) {
            const fallbackTopics = [...topicStats].sort((a, b) => {
                if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
                return b.total - a.total;
            });

            for (const topic of fallbackTopics) {
                if (!strengths.includes(topic.name) && !focusAreas.includes(topic.name)) {
                    focusAreas.push(topic.name);
                }
                if (focusAreas.length === 5) break;
            }
        }

        const focusAreaDetails = focusAreas
            .map((topicName) => topicStats.find((topic) => topic.name === topicName))
            .filter(Boolean)
            .map((topic) => ({
                name: topic.name,
                attempts: topic.total,
                accuracy: topic.accuracy,
                weaknessScore: topic.weaknessScore,
            }));

        const weaknesses = [...focusAreas];

        // Recent activity — return real question text + ISO timestamp
        const recentActivity = allAttempts.slice(0, 5).map(a => {
            const q = a.questionId;
            let title = '';
            if (q) {
                // Try multiple possible field names for the question text
                const rawText = q.question || q.questionText || q.title || '';
                // Strip HTML tags if present
                const cleanText = rawText.replace(/<[^>]*>/g, '').trim();
                if (cleanText) {
                    title = cleanText.length > 60 ? cleanText.substring(0, 60) + '…' : cleanText;
                }
                // Append subject or first tag as context (e.g. " - SQL")
                const context = q.subject || (q.tags?.length > 0 ? q.tags[0] : '');
                if (context && title) {
                    title += ` — ${context}`;
                } else if (context && !title) {
                    title = context;
                }
            }
            if (!title) title = 'Deleted Question';
            return {
                type: a.isCorrect ? 'completed' : 'attempted',
                title,
                time: a.attemptedAt, // ISO string for client-side relative formatting
                difficulty: q?.difficulty || 'Medium'
            };
        });

        // Weekly Activity (trailing 7 days)
        const weeklyActivity = [];
        const todayAtMidnight = new Date();
        todayAtMidnight.setHours(0, 0, 0, 0);
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date(todayAtMidnight);
            d.setDate(d.getDate() - i);
            const nextDay = new Date(d);
            nextDay.setDate(d.getDate() + 1);

            const dayAttempts = allAttempts.filter(a => {
                const attemptTime = new Date(a.attemptedAt);
                return attemptTime >= d && attemptTime < nextDay;
            });
            
            weeklyActivity.push({
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                count: dayAttempts.length
            });
        }

        res.json({
            success: true,
            data: {
                stats,
                subjectProgress,
                subjectHealthSummary,
                decayConfig: getDecayConfig(),
                strengths,
                focusAreas,
                focusAreaDetails,
                weaknesses,
                recentActivity,
                weeklyActivity
            }
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/attempts/advanced-insights
exports.getAdvancedInsights = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        const allAttempts = await Attempt.find({ userId })
            .populate('questionId', 'difficulty subject timeTakenSeconds eloRating')
            .sort({ attemptedAt: -1 })
            .lean();

        // ── 1. Difficulty Distribution ────────────────────────
        const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
        const diffCorrect = { Easy: 0, Medium: 0, Hard: 0 };
        allAttempts.forEach(a => {
            const d = a.questionId?.difficulty || 'Medium';
            if (diffCounts[d] !== undefined) {
                diffCounts[d]++;
                if (a.isCorrect) diffCorrect[d]++;
            }
        });
        const total = allAttempts.length;
        const difficultyDistribution = Object.entries(diffCounts).map(([label, count]) => ({
            label,
            count,
            pct: total > 0 ? Math.round((count / total) * 100) : 0,
            accuracy: count > 0 ? Math.round((diffCorrect[label] / count) * 100) : 0
        }));

        // ── 2. Speed Metrics ──────────────────────────────────
        const speedBuckets = { Easy: [], Medium: [], Hard: [] };
        allAttempts.forEach(a => {
            const d = a.questionId?.difficulty || 'Medium';
            const t = a.timeTakenSeconds;
            if (t && t > 0 && speedBuckets[d]) speedBuckets[d].push(t);
        });
        const speedMetrics = Object.entries(speedBuckets).map(([label, times]) => {
            const avg = times.length > 0 ? Math.round(times.reduce((s, v) => s + v, 0) / times.length) : null;
            return { label, avgSeconds: avg, count: times.length };
        });

        // ── 3. Quick Wins ─────────────────────────────────────
        // Correct on first attempt AND solved within 30 seconds
        const seenQuestions = new Set();
        let quickWins = 0;
        const quickWinList = [];
        // Iterate oldest first for first-attempt detection
        const chronological = [...allAttempts].reverse();
        chronological.forEach(a => {
            const qid = a.questionId?._id?.toString();
            if (!qid) return;
            if (!seenQuestions.has(qid)) {
                seenQuestions.add(qid);
                if (a.isCorrect && a.timeTakenSeconds > 0 && a.timeTakenSeconds <= 30) {
                    quickWins++;
                    if (quickWinList.length < 5) {
                        quickWinList.push({
                            subject: a.questionId?.subject || 'General',
                            difficulty: a.questionId?.difficulty || 'Medium',
                            timeTaken: a.timeTakenSeconds
                        });
                    }
                }
            }
        });

        // ── 4. Global Rankings ────────────────────────────────
        const studentXP = user.xp || 0;
        const totalUsers = await User.countDocuments({ role: 'student' });
        const usersBelow = await User.countDocuments({ role: 'student', xp: { $lt: studentXP } });
        const percentile = totalUsers > 0 ? Math.round((usersBelow / totalUsers) * 100) : 0;
        const globalRank = totalUsers - usersBelow;

        // ── 5. Consistency Score ──────────────────────────────
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentAttempts = allAttempts.filter(a => new Date(a.attemptedAt) >= thirtyDaysAgo);
        const activeDays = new Set(
            recentAttempts.map(a => new Date(a.attemptedAt).toISOString().split('T')[0])
        );
        const consistencyScore = Math.round((activeDays.size / 30) * 100);

        // ── 6. Peer Comparison ────────────────────────────────
        let peerData = null;
        if (user.instituteId) {
            const [peerAvgResult] = await User.aggregate([
                { $match: { role: 'student', instituteId: user.instituteId } },
                { $group: { _id: null, avgXP: { $avg: '$xp' }, count: { $sum: 1 } } }
            ]);
            if (peerAvgResult) {
                peerData = {
                    myXP: studentXP,
                    instituteAvgXP: Math.round(peerAvgResult.avgXP),
                    peerCount: peerAvgResult.count,
                    aboveAverage: studentXP >= peerAvgResult.avgXP
                };
            }
        }

        res.json({
            success: true,
            data: {
                difficultyDistribution,
                speedMetrics,
                quickWins: { count: quickWins, examples: quickWinList },
                globalRanking: { xp: studentXP, percentile, globalRank, totalUsers },
                consistencyScore: { score: consistencyScore, activeDays: activeDays.size, outOf: 30 },
                peerComparison: peerData
            }
        });
    } catch (error) {
        console.error('getAdvancedInsights error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


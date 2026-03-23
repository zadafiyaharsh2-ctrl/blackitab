const mongoose = require('mongoose');
const Attempt = require('../models/Attempt');

exports.getComprehensiveAnalytics = async (userId) => {
    try {
        const pipeline = [
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'examquestions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'question'
                }
            },
            { $unwind: '$question' },
            {
                $group: {
                    _id: '$question.subject',
                    totalAttempts: { $sum: 1 },
                    correctAnswers: { $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] } },
                    lastAttempted: { $max: '$attemptedAt' }
                }
            },
            {
                $project: {
                    subject: '$_id',
                    _id: 0,
                    totalAttempts: 1,
                    correctAnswers: 1,
                    accuracyPercentage: {
                        $round: [
                            { $multiply: [ { $divide: ['$correctAnswers', '$totalAttempts'] }, 100 ] },
                            2
                        ]
                    },
                    daysSinceLastPractice: {
                        $round: [
                            {
                                $divide: [
                                    { $subtract: [new Date(), { $toDate: '$lastAttempted' }] },
                                    1000 * 60 * 60 * 24
                                ]
                            },
                            1
                        ]
                    }
                }
            },
            { $sort: { accuracyPercentage: 1 } }
        ];

        const results = await Attempt.aggregate(pipeline);

        if (!results || results.length === 0) {
            return {
                weakestSubject: null,
                strongestSubject: null,
                allSubjects: []
            };
        }

        const allSubjects = results.map(r => ({
            name: r.subject,
            accuracy: r.accuracyPercentage
        }));

        const weakestSubject = results[0];
        const strongestSubject = results[results.length - 1];

        return {
            weakestSubject,
            strongestSubject,
            allSubjects
        };
    } catch (error) {
        console.error("Aggregation Error in getComprehensiveAnalytics:", error);
        throw error;
    }
};

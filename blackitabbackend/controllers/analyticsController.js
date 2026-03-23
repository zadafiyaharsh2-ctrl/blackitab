const mongoose = require('mongoose');
const Attempt = require('../models/Attempt');
const ExamQuestion = require('../models/ExamQuestion');

// Step 1: The Backend Aggregation (Database Optimization)
const fetchStudentWeaknessesAggregation = async (userId) => {
    try {
        const pipeline = [
            // 1. Match ONLY the current user's attempts
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            // 2. Lookup the Question to get the Subject
            {
                $lookup: {
                    from: 'examquestions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'question'
                }
            },
            { $unwind: '$question' },
            // 3. Group by Subject or Topic (Using Subject for this example)
            {
                $group: {
                    _id: '$question.subject',
                    totalAttempts: { $sum: 1 },
                    correctAttempts: { $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] } },
                    lastAttemptedAt: { $max: '$attemptedAt' }
                }
            },
            // 4. Calculate Accuracy and Time Elapsed
            {
                $project: {
                    subject: '$_id',
                    _id: 0,
                    totalAttempts: 1,
                    accuracyPercentage: {
                        $round: [
                            { $multiply: [ { $divide: ['$correctAttempts', '$totalAttempts'] }, 100 ] },
                            2
                        ]
                    },
                    daysSinceLastAttempt: {
                        $round: [
                            {
                                $divide: [
                                    { $subtract: [new Date(), '$lastAttemptedAt'] },
                                    1000 * 60 * 60 * 24 // ms in a day
                                ]
                            },
                            1
                        ]
                    }
                }
            },
            // 5. Sort by lowest accuracy first
            { $sort: { accuracyPercentage: 1 } },
            // 6. Limit to bottom 3 weakest topics
            { $limit: 3 }
        ];

        const weaknesses = await Attempt.aggregate(pipeline);
        return weaknesses;
    } catch (error) {
        console.error("Aggregation Error:", error);
        throw error;
    }
};

module.exports = {
    fetchStudentWeaknessesAggregation
};

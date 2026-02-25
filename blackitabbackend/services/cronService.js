const cron = require('node-cron');
const User = require('../models/User');
const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');

const startCronJobs = () => {
    // Run every night at midnight to compute leaderboards statically
    cron.schedule('0 0 * * *', async () => {
        console.log('Running nightly global ranking calculation...');
        try {
            // Simplified mass ranking algorithm. Pull metadata out and sort.
            const users = await User.find({ role: 'student' }).sort({ points: -1 }).select('_id instituteId');
            
            const totalUsers = users.length;
            let currentGlobalRank = 1;

            const instRanks = {}; // { <instituteId>: currentRankCounter }

            for (const user of users) {
                const instId = user.instituteId ? user.instituteId.toString() : 'independent';
                if (!instRanks[instId]) instRanks[instId] = 1;

                const userRank = currentGlobalRank;
                const userInstRank = instRanks[instId];
                const userPercentile = ((totalUsers - userRank) / totalUsers) * 100;

                // Create the immutable nightly snapshot.
                await AnalyticsSnapshot.create({
                    userId: user._id,
                    globalRank: userRank,
                    institutionRank: userInstRank,
                    percentile: userPercentile
                });

                // Update the User directly so the frontend profile updates
                await User.findByIdAndUpdate(user._id, { globalRank: userRank });

                currentGlobalRank++;
                instRanks[instId]++;
            }

            console.log('Nightly algorithmic ranking calculation completely successfully.');

        } catch (error) {
            console.error('Cron Job Ranking Computations Failed:', error);
        }
    });
};

module.exports = { startCronJobs };

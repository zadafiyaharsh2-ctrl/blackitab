/**
 * ============================================================================
 * CRON SERVICE — Nightly Background Jobs
 * ============================================================================
 *
 * Runs at midnight to compute global/institutional rankings.
 * Writes directly to User.globalRank and User.rating (percentile).
 * No separate snapshot collection needed — the User document IS the source of truth.
 */

const cron = require('node-cron');
const User = require('../models/User');

const startCronJobs = () => {
    // ── Nightly ranking recalculation at midnight ──
    cron.schedule('0 0 * * *', async () => {
        console.log('[Cron] Starting nightly ranking computation…');
        try {
            const users = await User.find({ role: 'student' })
                .sort({ points: -1 })
                .select('_id instituteId points');

            const totalUsers = users.length;
            if (totalUsers === 0) {
                console.log('[Cron] No students found, skipping.');
                return;
            }

            const instRanks = {}; // { <instituteId>: currentRank }
            const bulkOps = [];

            users.forEach((user, index) => {
                const globalRank = index + 1;
                const percentile = totalUsers > 1
                    ? ((totalUsers - globalRank) / (totalUsers - 1)) * 100
                    : 100;

                // Track institution-level ranking
                const instId = user.instituteId ? user.instituteId.toString() : 'independent';
                if (!instRanks[instId]) instRanks[instId] = 0;
                instRanks[instId]++;

                bulkOps.push({
                    updateOne: {
                        filter: { _id: user._id },
                        update: { $set: { globalRank, rating: Math.round(percentile * 100) / 100 } }
                    }
                });
            });

            // Single bulk write instead of N individual updates
            if (bulkOps.length > 0) {
                await User.bulkWrite(bulkOps);
            }

            console.log(`[Cron] Nightly ranking done — ${totalUsers} students updated.`);
        } catch (error) {
            console.error('[Cron] Ranking computation failed:', error);
        }
    });
};

module.exports = { startCronJobs };

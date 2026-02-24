const mongoose = require('mongoose');

const analyticsSnapshotSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    globalRank: { type: Number, default: 0 },
    institutionRank: { type: Number, default: 0 },
    percentile: { type: Number, default: 0 },
    snapshotDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);

const mongoose = require('mongoose');

const bugReportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'teacher', 'hod', 'institute', 'superadmin']
    },
    category: {
        type: String,
        enum: ['bug', 'security', 'abuse'],
        default: 'bug'
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    stepsToReproduce: {
        type: String,
        trim: true,
        maxlength: 2000
    },
    expectedBehavior: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    actualBehavior: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    endpoint: {
        type: String,
        trim: true,
        maxlength: 200
    },
    pageContext: {
        type: String,
        required: true,
        default: '/'
    },
    status: {
        type: String,
        required: true,
        enum: ['Open', 'In Progress', 'Resolved', 'Wont Fix'],
        default: 'Open'
    },
    adminFeedback: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

// Index for faster queries in admin dashboard
bugReportSchema.index({ status: 1, createdAt: -1 });

const BugReport = mongoose.model('BugReport', bugReportSchema);
module.exports = BugReport;

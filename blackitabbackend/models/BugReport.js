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
    description: {
        type: String,
        required: true,
        trim: true
    },
    pageContext: {
        type: String,
        required: true,
        default: '/'
    },
    status: {
        type: String,
        required: true,
        enum: ['Open', 'In Progress', 'Resolved'],
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

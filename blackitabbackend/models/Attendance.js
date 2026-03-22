const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'No Class'],
        default: 'Present'
    }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionType: {
        type: String,
        enum: ['Class', 'Lab'],
        default: 'Class'
    },
    date: {
        type: Date,
        required: true
    },
    records: [attendanceRecordSchema]
}, { 
    timestamps: true 
});

// Enforce Integrity: unique compound index per class per day and sessionType
attendanceSchema.index({ classId: 1, date: 1, sessionType: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

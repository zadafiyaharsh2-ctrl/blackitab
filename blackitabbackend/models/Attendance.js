const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'excused'],
        default: 'present'
    },
    remarks: {
        type: String,
        trim: true
    }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    records: [attendanceRecordSchema]
}, { 
    timestamps: true 
});

// Ensure only one attendance record per batch per day (ignoring time)
attendanceSchema.index({ batchId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

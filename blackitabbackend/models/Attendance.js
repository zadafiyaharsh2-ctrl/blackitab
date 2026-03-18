const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late'],
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
    date: {
        type: Date,
        required: true
    },
    records: [attendanceRecordSchema]
}, { 
    timestamps: true 
});

// Enforce Integrity: unique compound index strictly per class per day
attendanceSchema.index({ classId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

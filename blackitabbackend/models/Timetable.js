const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true,
        index: true
    },
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true,
        index: true
    },
    schedule: [
        {
            dayOfWeek: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                required: true
            },
            periods: [
                {
                    startTime: { type: String, required: true }, // Format: "09:00 AM"
                    endTime: { type: String, required: true },
                    subject: { type: String, required: true },
                    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                    roomNumber: { type: String, default: '' },
                    isLab: { type: Boolean, default: false }
                }
            ]
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

timetableSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Timetable', timetableSchema);

const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Department code is required'],
        trim: true,
        uppercase: true
    },
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true,
        index: true
    },
    hodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// One department code per institute
departmentSchema.index({ instituteId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);

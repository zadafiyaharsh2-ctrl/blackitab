const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Title is required'], 
        trim: true 
    },
    description: { 
        type: String, 
        required: [true, 'Description is required'] 
    },
    category: { 
        type: String, 
        enum: ['Infrastructure', 'Teacher/Harassment', 'Curriculum', 'Peer Issue', 'Other'], 
        default: 'Other' 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Resolved'], 
        default: 'Pending' 
    },
    resolutionNotes: { 
        type: String, 
        default: '' 
    },
    isAnonymous: { 
        type: Boolean, 
        default: false 
    },
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    instituteId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Institute', 
        required: true,
        index: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Update the updatedAt timestamp before saving
complaintSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Complaint', complaintSchema);

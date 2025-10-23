const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['patient', 'doctor'],
        default: 'patient'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // Patient specific fields
    age: {
        type: Number,
        required: function() { return this.role === 'patient'; }
    },
    gender: {
        type: String,
        required: function() { return this.role === 'patient'; }
    },
    bloodGroup: {
        type: String,
        required: function() { return this.role === 'patient'; }
    },
    address: {
        type: String,
        required: function() { return this.role === 'patient'; }
    },
    condition: {
        type: String,
        default: 'General Checkup'
    },
    lastVisit: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "Active",
        enum: ['Active', 'Inactive', 'Critical', 'Recovered']
    },
    // Doctor specific fields
    qualification: {
        type: String,
        required: function() { return this.role === 'doctor'; }
    },
    experience: {
        type: String,
        required: function() { return this.role === 'doctor'; }
    },
    specialty: {
        type: String,
        required: function() { return this.role === 'doctor'; }
    },
    consultationFee: {
        type: Number,
        default: 150
    },
    availableDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    availableTime: {
        type: String,
        default: '9:00 AM - 5:00 PM'
    },
    bio: {
        type: String
    },
    image: {
        type: String
    }
}, {
    timestamps: true
});
userSchema.index({ role: 1, email: 1 });
userSchema.index({ role: 1, createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        console.error('Error in user pre-save hook:', error);
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;

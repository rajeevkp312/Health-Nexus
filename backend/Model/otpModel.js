const mongoose = require('mongoose');

const otpSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['registration', 'forgot_password'],
        required: true
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 600 // 10 minutes
    },
    isUsed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for automatic deletion
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const otpModel = mongoose.model('OTP', otpSchema);
module.exports = otpModel;

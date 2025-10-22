const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const nodemailer = require('nodemailer');
const User = require('../Model/userModel');
const OTP = require('../Model/otpModel');

// Resend configuration
const RESEND_KEY = process.env.RESEND_API_KEY || process.env.RESEND_KEY;
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

// Nodemailer SMTP configuration (uses Gmail by default)
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const smtpTransporter = (smtpUser && smtpPass) ? nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: smtpUser, pass: smtpPass },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    }
}) : null;

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email (prefers Nodemailer SMTP; falls back to Resend)
const sendOTPEmail = async (email, otp, type) => {
    const subject = type === 'registration' ? 'Email Verification - HealthNexus' : 'Password Reset - HealthNexus';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">HealthNexus</h1>
                <p style="color: #e0e7ff; margin: 10px 0 0 0;">Your Health, Our Priority</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">${type === 'registration' ? 'Verify Your Email' : 'Reset Your Password'}</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    ${type === 'registration' ? 
                        'Thank you for registering with HealthNexus! Please use the following OTP to verify your email address:' : 
                        'You requested to reset your password. Please use the following OTP to proceed:'
                    }
                </p>
                <div style="background: #f8fafc; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                    <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
                </div>
                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                    <strong>Important:</strong> This OTP will expire in 10 minutes. Please do not share this code with anyone.
                </p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        If you didn't request this, please ignore this email or contact our support team.
                    </p>
                </div>
            </div>
        </div>
    `;

    // 1) Try Nodemailer SMTP if configured
    if (smtpTransporter) {
        try {
            await smtpTransporter.sendMail({
                from: `HealthNexus <${smtpUser}>`,
                to: email,
                subject,
                html,
                priority: 'high',
                headers: { 'X-Priority': '1', 'X-MSMail-Priority': 'High' }
            });
            console.log(`✅ Email sent successfully to ${email} via Nodemailer`);
            return true;
        } catch (smtpError) {
            console.error('❌ Nodemailer SMTP error:', smtpError);
        }
    }

    // 2) Fallback to Resend (only if API key provided)
    if (resend) {
        try {
            const { data, error } = await resend.emails.send({
                from: 'HealthNexus <onboarding@resend.dev>',
                to: [email],
                subject,
                html,
            });

            if (error) {
                console.error('❌ Resend API error:', error);
                console.log(`📧 EMAIL FALLBACK - OTP for ${email}: ${otp}`);
                console.log(`🔔 Please use this OTP code: ${otp}`);
                return true; // allow flow to continue in development
            }

            console.log(`✅ Email sent successfully to ${email} via Resend`);
            console.log(`📧 Email ID: ${data.id}`);
            return true;
        } catch (error) {
            console.error('❌ Email sending error (Resend fallback):', error);
            console.log(`📧 EMAIL FALLBACK - OTP for ${email}: ${otp}`);
            console.log(`🔔 Please use this OTP code: ${otp}`);
            return true; // allow flow to continue in development
        }
    } else {
        if (process.env.NODE_ENV === 'production') {
            return false;
        }
        console.warn('Resend API key not set; using console fallback for OTP.');
        console.log(`📧 EMAIL FALLBACK - OTP for ${email}: ${otp}`);
        console.log(`🔔 Please use this OTP code: ${otp}`);
        return true;
    }
};

// Register Patient
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, age, gender, bloodGroup, address } = req.body;

        // Validation
        if (!name || !email || !password || !phone || !age || !gender || !bloodGroup || !address) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // In production, ensure email provider is configured
        if (process.env.NODE_ENV === 'production' && !smtpTransporter && !resend) {
            return res.status(500).json({
                success: false,
                message: 'Email service not configured on server'
            });
        }

        // Generate OTP
        const otp = generateOTP();

        // Save OTP to database
        await OTP.create({
            email,
            otp,
            type: 'registration'
        });

        // Send OTP email (non-blocking)
        sendOTPEmail(email, otp, 'registration').catch((e) => console.error('OTP email error:', e));
        
        res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Please verify to complete registration.',
            email: email
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify OTP and Complete Registration
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp, userData } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Find valid OTP
        const otpRecord = await OTP.findOne({
            email,
            otp,
            type: 'registration',
            isUsed: false
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();

        // Create user
        const newUser = new User({
            ...userData,
            email,
            role: 'patient',
            isVerified: true
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration completed successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role, rememberMe } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and role are required'
            });
        }

        // Find user
        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Please verify your email first'
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const tokenExpiry = rememberMe ? '30d' : '7d';
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: tokenExpiry }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User with this email does not exist'
            });
        }

        // In production, ensure email provider is configured
        if (process.env.NODE_ENV === 'production' && !smtpTransporter && !resend) {
            return res.status(500).json({
                success: false,
                message: 'Email service not configured on server'
            });
        }

        // Generate OTP
        const otp = generateOTP();

        // Save OTP to database
        await OTP.create({
            email,
            otp,
            type: 'forgot_password'
        });

        // Send OTP email (non-blocking)
        sendOTPEmail(email, otp, 'forgot_password').catch((e) => console.error('Reset OTP email error:', e));
        
        res.status(200).json({
            success: true,
            message: 'Password reset OTP sent to your email'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required'
            });
        }

        // Find valid OTP
        const otpRecord = await OTP.findOne({
            email,
            otp,
            type: 'forgot_password',
            isUsed: false
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();

        // Update user password
        const user = await User.findOne({ email });
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get User Profile
router.get('/profile/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Find user by ID
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile fetched successfully',
            user: user
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update User Profile
router.put('/profile/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        
        // Remove password from update data for security
        delete updateData.password;
        
        // Find and update user
        const user = await User.findByIdAndUpdate(userId, updateData, { 
            new: true,
            runValidators: true 
        }).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: user
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get All Patients (for admin)
router.get('/patients', async (req, res) => {
    try {
        // Find all users with patient role
        const patients = await User.find({ role: 'patient' }).select('-password');
        
        res.status(200).json({
            success: true,
            message: 'Patients fetched successfully',
            value: patients // Using 'value' to match existing API structure
        });

    } catch (error) {
        console.error('Patients fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;

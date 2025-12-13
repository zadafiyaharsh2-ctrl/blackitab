const nodemailer = require('nodemailer');

/**
 * Create reusable transporter
 * Uses Gmail SMTP with App Password
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
            ? process.env.EMAIL_PASS.replace(/\s+/g, '')
            : ''
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 60 * 1000,
});

/**
 * Verify SMTP connection once at startup
 */
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
    } else {
        console.log('✅ Email transporter is ready');
    }
});

/**
 * Send OTP Email
 * @param {string} email
 * @param {string|number} otp
 */
const sendOTP = async (email, otp) => {
    console.log('------------------------------------------------');
    console.log('📧 EMAIL SERVICE INITIATED');
    console.log(`Target: ${email}`);

    // ✅ DEV MODE: If no credentials, log the OTP and return success
    if ((!process.env.EMAIL_USER || !process.env.EMAIL_PASS) && process.env.NODE_ENV !== 'production') {
        console.log('\n================================================================');
        console.log('📧 EMAIL SERVICE (DEV MODE - NO CREDENTIALS)');
        console.log(`To: ${email}`);
        console.log(`OTP: ${otp}`);
        console.log('================================================================\n');
        return true;
    }

    // ❌ Missing credentials safety check (Production or if configured incorrectly)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ EMAIL credentials are missing');
        return false;
    }

    const mailOptions = {
        from: `"Blackitab Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your OTP Verification Code',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
        <h2 style="color: #4F46E5;">Email Verification</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="letter-spacing: 6px; font-size: 32px;">${otp}</h1>
        <p>This OTP will expire in <b>10 minutes</b>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br />
        <small style="color: #666;">© Blackitab Security</small>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP successfully sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);

        // 🔁 Fallback OTP logging
        console.log('\n================================================================');
        console.log('⚠️ EMAIL FAILED - FALLBACK OTP LOG');
        console.log(`OTP: ${otp}`);
        console.log('================================================================\n');

        return false;
    }
};

module.exports = { sendOTP };

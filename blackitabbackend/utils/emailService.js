const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : ''
    },
    tls: {
        rejectUnauthorized: false // Helps avoid some strict SSL errors in dev/staging
    }
});

const sendOTP = async (email, otp) => {
    console.log('------------------------------------------------');
    console.log('📧 EMAIL SERVICE INITIATED');
    console.log(`Target: ${email}`);

    // Check if we are using placeholder credentials
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email')) {
        console.log('\n================================================================');
        console.log('📧 EMAIL SERVICE (DEV MODE)');
        console.log(`To: ${email}`);
        console.log(`OTP: ${otp}`);
        console.log('================================================================\n');
        return true; // Simulate success
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Verification Code',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">Verification Code</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        // Fallback logging even if real email fails
        console.log('\n================================================================');
        console.log('⚠️ EMAIL FAILED - FALLBACK OTP LOG');
        console.log(`OTP: ${otp}`);
        console.log('================================================================\n');
        return false;
    }
};

module.exports = { sendOTP };

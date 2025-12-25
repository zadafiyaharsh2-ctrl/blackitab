const nodemailer = require('nodemailer');

const sendOTP = async (email, otp) => {
    console.log('------------------------------------------------');
    console.log('📧 EMAIL SERVICE (NODEMAILER) INITIATED');
    console.log(`Target: ${email}`);

    // Create Transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
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
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP successfully sent to ${email}. ID: ${info.messageId}`);
        return true;

    } catch (error) {
        console.error('❌ Nodemailer Error:', error);
        // Fallback logging
        console.log('\n================================================================');
        console.log('⚠️ EMAIL FAILED - FALLBACK OTP LOG');
        console.log(`OTP: ${otp}`);
        console.log('================================================================\n');
        return false;
    }
};

module.exports = { sendOTP };

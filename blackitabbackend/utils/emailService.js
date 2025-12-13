const { Resend } = require('resend');

// Initialize Resend with API Key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP Email using Resend
 * @param {string} email
 * @param {string|number} otp
 */
const sendOTP = async (email, otp) => {
    console.log('------------------------------------------------');
    console.log('📧 EMAIL SERVICE (RESEND) INITIATED');
    console.log(`Target: ${email}`);

    // ✅ DEV MODE: If no API key, log the OTP and return success
    if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== 'production') {
        console.log('\n================================================================');
        console.log('📧 EMAIL SERVICE (DEV MODE - NO API KEY)');
        console.log(`To: ${email}`);
        console.log(`OTP: ${otp}`);
        console.log('================================================================\n');
        return true;
    }

    // ❌ Missing API Key check
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is missing in environment variables');
        return false;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Blackitab Security <onboarding@resend.dev>', // Use default testing domain or verified domain
            to: [email], // Resend requires an array for 'to'
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
        });

        if (error) {
            console.error('❌ Resend API Error:', error);
            // Fallback logging
            console.log('\n================================================================');
            console.log('⚠️ EMAIL FAILED - FALLBACK OTP LOG');
            console.log(`OTP: ${otp}`);
            console.log('================================================================\n');
            return false;
        }

        console.log(`✅ OTP successfully sent to ${email}. ID: ${data.id}`);
        return true;

    } catch (err) {
        console.error('❌ Unexpected Error in Email Service:', err);
        // Fallback logging
        console.log('\n================================================================');
        console.log('⚠️ EMAIL FAILED (Exception) - FALLBACK OTP LOG');
        console.log(`OTP: ${otp}`);
        console.log('================================================================\n');
        return false;
    }
};

module.exports = { sendOTP };

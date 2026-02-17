const { Resend } = require('resend');

const sendOTP = async (email, otp) => {
    console.log(`📧 Sending OTP to ${email}`);
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: 'Blackitab Security <onboarding@resend.dev>',
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
        });

        if (error) {
            console.error('❌ Resend Error:', error);
            console.log(`⚠️ EMAIL FAILED — Fallback OTP: ${otp}`);
            return false;
        }

        console.log(`✅ OTP sent to ${email} (ID: ${data.id})`);
        return true;
    } catch (error) {
        console.error('❌ Resend Error:', error);
        console.log(`⚠️ EMAIL FAILED — Fallback OTP: ${otp}`);
        return false;
    }
};

module.exports = { sendOTP };

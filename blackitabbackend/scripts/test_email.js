require('dotenv').config();
const { sendOTP } = require('./utils/emailService');

async function test() {
    console.log('Testing email service...');
    // Try sending to the email seeing the error or a generic one
    const email = 'zadafiyah2@gmail.com';
    const otp = '123456';

    console.log(`Sending to ${email} with Key: ${process.env.RESEND_API_KEY ? 'Present' : 'MISSING'}`);

    const result = await sendOTP(email, otp);
    console.log('Result:', result);
}

test();

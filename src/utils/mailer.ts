import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTP = async (to: string, otp: string) => {
  if (!process.env.SMTP_USER) {
    console.warn("⚠️ SMTP credentials not set. Simulated OTP email:");
    console.warn(`To: ${to}, OTP: ${otp}`);
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'Your AI Studio Verification Code',
    text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to AI Studio</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #4F46E5; letter-spacing: 2px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

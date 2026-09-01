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
    subject: 'Your AI Manga Studio Verification Code',
    text: `Your verification code is: ${otp}. It will expire in 10 minutes. Welcome to Your AI Manga Studio!`,
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f8fafc; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #f43f5e; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 0.05em; text-transform: uppercase;">Your AI Manga Studio</h1>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Professional AI-Powered Sequential Art & Manga Pipeline</p>
        </div>
        <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
          <p style="color: #cbd5e1; font-size: 15px; margin-bottom: 16px;">Please use the secure verification code below to complete your sign-in:</p>
          <div style="background: linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(79, 70, 229, 0.15)); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 8px; padding: 16px; display: inline-block; margin: 8px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; color: #fb7185; letter-spacing: 6px;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">This code will expire in 10 minutes. If you did not request this verification, please safely ignore this message.</p>
        </div>
        <div style="text-align: center; margin-top: 24px; color: #475569; font-size: 11px;">
          &copy; ${new Date().getFullYear()} Your AI Manga Studio. All rights reserved.
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

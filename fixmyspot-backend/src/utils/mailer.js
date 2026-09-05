import nodemailer from "nodemailer";

function buildTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP email settings are not configured in .env");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export async function sendResetOtp(email, otp) {
  const transporter = buildTransport();
  const expires = process.env.OTP_EXPIRES_MINUTES || "10";

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: "FixMySpot password reset OTP",
    text: `Your FixMySpot password reset OTP is ${otp}. It expires in ${expires} minutes. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
        <h2>FixMySpot password reset</h2>
        <p>Use this OTP to reset your password:</p>
        <div style="font-size:32px;font-weight:800;letter-spacing:8px;padding:18px 0">${otp}</div>
        <p>This OTP expires in ${expires} minutes.</p>
        <p style="color:#777">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `
  });
}
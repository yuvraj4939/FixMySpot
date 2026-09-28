import User from "../models/User.js";
import { hashPassword, verifyPassword, tokenFor, publicUser } from "../utils/auth.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import { sendResetOtp } from "../utils/mailer.js";

const OTP_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES || 10);
const OTP_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

export async function register(req, res) {
  const name = req.body.name?.trim();
  const email = normalizeEmail(req.body.email);
  const password = req.body.password || "";
  const area = req.body.area?.trim() || "Lucknow";

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({ message: "Name must be between 2 and 80 characters" });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  if (await User.findOne({ email })) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    area
  });

  return res.status(201).json({ user: publicUser(user), token: tokenFor(user) });
}

export async function login(req, res) {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password || "";
  const user = await User.findOne({ email });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  return res.json({ user: publicUser(user), token: tokenFor(user) });
}

export async function me(req, res) {
  return res.json({ user: publicUser(req.user) });
}

export async function seedAdmin(req, res) {
  const setupKey = process.env.ADMIN_SETUP_KEY;
  if (process.env.NODE_ENV === "production" && !setupKey) {
    return res.status(503).json({ message: "Admin setup is disabled until ADMIN_SETUP_KEY is configured" });
  }

  if (setupKey && req.headers["x-admin-setup-key"] !== setupKey) {
    return res.status(403).json({ message: "Invalid admin setup key" });
  }

  const name = req.body.name?.trim();
  const email = normalizeEmail(req.body.email);
  const password = req.body.password || "";

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  if (!EMAIL_PATTERN.test(email) || password.length < 6) {
    return res.status(400).json({ message: "Enter a valid email and a password of at least 6 characters" });
  }

  if (await User.findOne({ email })) {
    return res.status(409).json({ message: "User already exists" });
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    role: "admin"
  });

  return res.status(201).json({ user: publicUser(user), token: tokenFor(user) });
}

export async function requestPasswordReset(req, res) {
  const email = normalizeEmail(req.body.email);
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "If an account exists for that email, an OTP has been sent." });
  }

  const now = Date.now();
  if (user.resetOtpLastSentAt && now - user.resetOtpLastSentAt.getTime() < OTP_COOLDOWN_SECONDS * 1000) {
    return res.status(429).json({ message: "Please wait before requesting another OTP." });
  }

  const otp = generateOtp();
  user.resetOtpHash = hashOtp(otp);
  user.resetOtpExpiresAt = new Date(now + OTP_MINUTES * 60 * 1000);
  user.resetOtpAttempts = 0;
  user.resetOtpLastSentAt = new Date(now);
  await user.save();

  try {
    await sendResetOtp(user.email, otp);
  } catch (error) {
    user.resetOtpHash = "";
    user.resetOtpExpiresAt = null;
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = null;
    await user.save();
    console.error("Password reset email failed:", error.message);
    return res.status(503).json({ message: "Unable to send the OTP email. Please try again later." });
  }

  return res.json({ message: "If an account exists for that email, an OTP has been sent." });
}

async function findValidOtpUser(email, otp) {
  const user = await User.findOne({ email });
  if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
    return { error: { status: 400, message: "Invalid or expired OTP" } };
  }

  if (user.resetOtpExpiresAt.getTime() < Date.now()) {
    user.resetOtpHash = "";
    user.resetOtpExpiresAt = null;
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = null;
    await user.save();
    return { error: { status: 400, message: "OTP has expired. Please request a new one." } };
  }

  if (user.resetOtpAttempts >= MAX_OTP_ATTEMPTS) {
    return { error: { status: 429, message: "Too many incorrect attempts. Please request a new OTP." } };
  }

  if (hashOtp(otp) !== user.resetOtpHash) {
    user.resetOtpAttempts += 1;
    await user.save();
    return { error: { status: 400, message: "Invalid OTP" } };
  }

  return { user };
}

export async function verifyResetOtp(req, res) {
  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp || "").trim();

  if (!email || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: "Email and a 6-digit OTP are required" });
  }

  const { user, error } = await findValidOtpUser(email, otp);
  if (error) return res.status(error.status).json({ message: error.message });

  return res.json({ verified: true, message: "OTP verified. You can now set a new password." });
}

export async function resetPassword(req, res) {
  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp || "").trim();
  const newPassword = req.body.newPassword || "";

  if (!email || !/^\d{6}$/.test(otp) || newPassword.length < 6) {
    return res.status(400).json({ message: "Email, 6-digit OTP and a password of at least 6 characters are required" });
  }

  const { user, error } = await findValidOtpUser(email, otp);
  if (error) return res.status(error.status).json({ message: error.message });

  user.passwordHash = await hashPassword(newPassword);
  user.resetOtpHash = "";
  user.resetOtpExpiresAt = null;
  user.resetOtpAttempts = 0;
  user.resetOtpLastSentAt = null;
  await user.save();

  return res.json({ message: "Password reset successful. You can now log in." });
}

import User from "../models/User.js";
import { hashPassword, verifyPassword, tokenFor, publicUser } from "../utils/auth.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import { sendResetOtp } from "../utils/mailer.js";

const OTP_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES || 10);
const OTP_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

export async function register(req,res){
  const {name,email,password,area}=req.body;
  if(!name||!email||!password)return res.status(400).json({message:"Name, email and password are required"});
  if(password.length<6)return res.status(400).json({message:"Password must be at least 6 characters"});
  if(await User.findOne({email:email.toLowerCase()}))return res.status(409).json({message:"Email is already registered"});
  const u=await User.create({name,email:email.toLowerCase(),passwordHash:await hashPassword(password),area:area||"Lucknow"});
  res.status(201).json({user:publicUser(u),token:tokenFor(u)});
}

export async function login(req,res){
  const {email,password}=req.body;
  const u=await User.findOne({email:email?.toLowerCase()});
  if(!u||!(await verifyPassword(password||"",u.passwordHash)))return res.status(401).json({message:"Invalid email or password"});
  res.json({user:publicUser(u),token:tokenFor(u)});
}

export async function me(req,res){res.json({user:publicUser(req.user)})}

export async function seedAdmin(req,res){
  const {name,email,password}=req.body;
  if(!name||!email||!password)return res.status(400).json({message:"Name, email and password are required"});
  if(await User.findOne({email:email.toLowerCase()}))return res.status(409).json({message:"User already exists"});
  const u=await User.create({name,email:email.toLowerCase(),passwordHash:await hashPassword(password),role:"admin"});
  res.status(201).json({user:publicUser(u),token:tokenFor(u)});
}

export async function requestPasswordReset(req,res){
  const email = req.body.email?.toLowerCase().trim();
  if(!email)return res.status(400).json({message:"Email is required"});

  const user = await User.findOne({email});
  // Avoid revealing whether the email exists.
  if(!user){
    return res.json({message:"If an account exists for that email, an OTP has been sent."});
  }

  const now = Date.now();
  if(user.resetOtpLastSentAt && now - user.resetOtpLastSentAt.getTime() < OTP_COOLDOWN_SECONDS * 1000){
    return res.status(429).json({message:"Please wait before requesting another OTP."});
  }

  const otp = generateOtp();
  user.resetOtpHash = hashOtp(otp);
  user.resetOtpExpiresAt = new Date(now + OTP_MINUTES * 60 * 1000);
  user.resetOtpAttempts = 0;
  user.resetOtpLastSentAt = new Date(now);
  await user.save();

  await sendResetOtp(user.email, otp);
  return res.json({message:"If an account exists for that email, an OTP has been sent."});
}

export async function verifyResetOtp(req,res){
  const email = req.body.email?.toLowerCase().trim();
  const otp = String(req.body.otp || "").trim();

  if(!email || !/^\d{6}$/.test(otp)){
    return res.status(400).json({message:"Email and a 6-digit OTP are required"});
  }

  const user = await User.findOne({email});
  if(!user || !user.resetOtpHash || !user.resetOtpExpiresAt){
    return res.status(400).json({message:"Invalid or expired OTP"});
  }

  if(user.resetOtpExpiresAt.getTime() < Date.now()){
    user.resetOtpHash = "";
    user.resetOtpExpiresAt = null;
    user.resetOtpAttempts = 0;
    await user.save();
    return res.status(400).json({message:"OTP has expired. Please request a new one."});
  }

  if(user.resetOtpAttempts >= MAX_OTP_ATTEMPTS){
    return res.status(429).json({message:"Too many incorrect attempts. Please request a new OTP."});
  }

  if(hashOtp(otp) !== user.resetOtpHash){
    user.resetOtpAttempts += 1;
    await user.save();
    return res.status(400).json({message:"Invalid OTP"});
  }

  res.json({verified:true,message:"OTP verified. You can now set a new password."});
}

export async function resetPassword(req,res){
  const email = req.body.email?.toLowerCase().trim();
  const otp = String(req.body.otp || "").trim();
  const newPassword = req.body.newPassword || "";

  if(!email || !/^\d{6}$/.test(otp) || newPassword.length < 6){
    return res.status(400).json({message:"Email, 6-digit OTP and a password of at least 6 characters are required"});
  }

  const user = await User.findOne({email});
  if(!user || !user.resetOtpHash || !user.resetOtpExpiresAt){
    return res.status(400).json({message:"Invalid or expired OTP"});
  }

  if(user.resetOtpExpiresAt.getTime() < Date.now()){
    return res.status(400).json({message:"OTP has expired. Please request a new one."});
  }

  if(user.resetOtpAttempts >= MAX_OTP_ATTEMPTS){
    return res.status(429).json({message:"Too many incorrect attempts. Please request a new OTP."});
  }

  if(hashOtp(otp) !== user.resetOtpHash){
    user.resetOtpAttempts += 1;
    await user.save();
    return res.status(400).json({message:"Invalid OTP"});
  }

  user.passwordHash = await hashPassword(newPassword);
  user.resetOtpHash = "";
  user.resetOtpExpiresAt = null;
  user.resetOtpAttempts = 0;
  user.resetOtpLastSentAt = null;
  await user.save();

  res.json({message:"Password reset successful. You can now log in."});
}
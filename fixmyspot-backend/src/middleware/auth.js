import jwt from "jsonwebtoken";
import User from "../models/User.js";
export async function requireAuth(req,res,next){
 const header=req.headers.authorization||""; const token=header.startsWith("Bearer ")?header.slice(7):null;
 if(!token)return res.status(401).json({message:"Authentication required"});
 try{const d=jwt.verify(token,process.env.JWT_SECRET);const u=await User.findById(d.userId);if(!u)return res.status(401).json({message:"User not found"});req.user=u;next()}catch{res.status(401).json({message:"Invalid or expired token"})}
}
export function requireAdmin(req,res,next){if(req.user?.role!=="admin")return res.status(403).json({message:"Admin access required"});next()}

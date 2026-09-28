import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const hashPassword=p=>bcrypt.hash(p,12);
export const verifyPassword=(p,h)=>bcrypt.compare(p,h);
export const tokenFor=u=>jwt.sign({userId:u._id.toString(),role:u.role},process.env.JWT_SECRET,{expiresIn:"7d"});
export const publicUser=u=>({id:u._id.toString(),name:u.name,email:u.email,role:u.role,area:u.area});

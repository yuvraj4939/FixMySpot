import User from "../models/User.js";
import Report from "../models/Report.js";
export async function users(_req,res){const list=await User.find().select("-passwordHash").sort({createdAt:-1});const counts=await Report.aggregate([{$group:{_id:"$reporter",reports:{$sum:1}}}]);const m=new Map(counts.map(x=>[x._id.toString(),x.reports]));res.json({users:list.map(u=>({...u.toObject(),id:u._id.toString(),reports:m.get(u._id.toString())||0}))})}

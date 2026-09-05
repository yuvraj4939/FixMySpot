import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name:{type:String,required:true,trim:true},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  passwordHash:{type:String,required:true},
  role:{type:String,enum:["user","admin"],default:"user"},
  area:{type:String,default:"Lucknow"},
  resetOtpHash:{type:String,default:""},
  resetOtpExpiresAt:{type:Date,default:null},
  resetOtpAttempts:{type:Number,default:0},
  resetOtpLastSentAt:{type:Date,default:null}
},{timestamps:true});

export default mongoose.model("User",schema);
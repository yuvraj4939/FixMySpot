import mongoose from "mongoose";
const schema = new mongoose.Schema({
  title:{type:String,required:true,trim:true},
  category:{type:String,enum:["Road","Electricity","Water","Cleanliness","Safety","Public Property"],required:true},
  severity:{type:String,enum:["Low","Medium","High"],default:"Medium"},
  status:{type:String,enum:["Reported","Community Verified","In Progress","Fixed"],default:"Reported"},
  description:{type:String,required:true},
  location:{
    address:{type:String,default:""},
    latitude:{type:Number,required:true},
    longitude:{type:Number,required:true}
  },
  imageUrl:{type:String,default:""},
  confirmations:{type:Number,default:0},
  confirmedBy:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
  reporter:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true});
export default mongoose.model("Report",schema);

import Report from "../models/Report.js";
function priority(r){const s={Low:15,Medium:35,High:55}[r.severity]||15;const days=Math.max(0,Math.floor((Date.now()-new Date(r.createdAt).getTime())/86400000));return Math.min(100,s+(r.confirmations||0)*2+Math.min(days*2,25))}
function out(r){const x=r.toObject();return {...x,id:x._id.toString(),priority:priority(r)}}
export async function list(req,res){const f={};if(req.query.category&&req.query.category!=="All")f.category=req.query.category;if(req.query.status&&req.query.status!=="All")f.status=req.query.status;if(req.query.mine==="true")f.reporter=req.user._id;const rows=await Report.find(f).populate("reporter","name email").sort({createdAt:-1});res.json({reports:rows.map(out)})}
export async function get(req,res){const r=await Report.findById(req.params.id).populate("reporter","name email");if(!r)return res.status(404).json({message:"Report not found"});res.json({report:out(r)})}
export async function create(req,res){
  const {title,category,severity,description,address,latitude,longitude}=req.body;
  if(!title||!category||!description||latitude===undefined||longitude===undefined)
    return res.status(400).json({message:"Title, category, description and coordinates are required"});
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
  const r=await Report.create({
    title,category,severity:severity||"Medium",description,
    location:{address:address||"",latitude:Number(latitude),longitude:Number(longitude)},
    imageUrl,
    reporter:req.user._id
  });
  res.status(201).json({report:out(r)});
}
export async function confirm(req,res){const r=await Report.findById(req.params.id);if(!r)return res.status(404).json({message:"Report not found"});if(r.confirmedBy.some(id=>id.toString()===req.user._id.toString()))return res.status(409).json({message:"You already confirmed this report"});r.confirmedBy.push(req.user._id);r.confirmations++;if(r.confirmations>=5&&r.status==="Reported")r.status="Community Verified";await r.save();res.json({report:out(r)})}
export async function status(req,res){const allowed=["Reported","Community Verified","In Progress","Fixed"];if(!allowed.includes(req.body.status))return res.status(400).json({message:"Invalid status"});const r=await Report.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true});if(!r)return res.status(404).json({message:"Report not found"});res.json({report:out(r)})}
export async function stats(_req,res){const [total,active,fixed,high]=await Promise.all([Report.countDocuments(),Report.countDocuments({status:{$ne:"Fixed"}}),Report.countDocuments({status:"Fixed"}),Report.countDocuments({severity:"High",status:{$ne:"Fixed"}})]);res.json({total,active,fixed,high})}

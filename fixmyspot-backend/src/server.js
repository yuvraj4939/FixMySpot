import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (_req,res)=>res.json({ok:true,message:"FixMySpot API is running"}));
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

app.use((err,_req,res,_next)=>{
  console.error(err);
  res.status(err.status||500).json({message:err.message||"Internal server error"});
});

mongoose.connect(process.env.MONGO_URI)
  .then(()=>app.listen(PORT,()=>console.log(`MongoDB connected\nFixMySpot API running on http://localhost:${PORT}`)))
  .catch(err=>{console.error("MongoDB connection failed:",err.message);process.exit(1)});

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

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
if (process.env.NODE_ENV === "production" && !process.env.CLIENT_URL) requiredEnv.push("CLIENT_URL");
const missingRequired = requiredEnv.filter((name) => !process.env[name]);
if (missingRequired.length) {
  console.error(`Missing required environment variables: ${missingRequired.join(", ")}`);
  process.exit(1);
}
if (process.env.NODE_ENV === "production" && (process.env.JWT_SECRET.length < 32 || /replace_with/i.test(process.env.JWT_SECRET))) {
  console.error("JWT_SECRET must be a strong random secret of at least 32 characters in production.");
  process.exit(1);
}

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.disable("x-powered-by");

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by FixMySpot CORS policy."));
  }
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false, limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (_req, res) => {
  res.json({ name: "FixMySpot API", status: "ok" });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "FixMySpot API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const isUploadError = err?.code === "LIMIT_FILE_SIZE" || err?.message === "Only image files are allowed.";
  const status = err.status || (isUploadError ? 400 : 500);
  res.status(status).json({ message: err.message || "Internal server error" });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const server = app.listen(PORT, () => {
      const publicUrl = process.env.PUBLIC_API_URL || `http://localhost:${PORT}`;
      console.log(`MongoDB connected\nFixMySpot API running on ${publicUrl}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down FixMySpot API...`);
      await mongoose.connection.close();
      server.close(() => process.exit(0));
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

start();

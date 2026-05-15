import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });
import connectDB from "./config/db.js";

// Lightweight Genie config validation for startup
const mask = (s) => {
  if (!s) return "MISSING";
  if (s.length <= 8) return "****";
  return s.slice(0, 4) + "..." + s.slice(-4);
};

const validateGenieConfig = () => {
  const env = process.env.GENIE_ENV || "(not set)";
  const merchant = process.env.GENIE_MERCHANT_ID ? "SET" : "MISSING";
  const apiKeySet = !!process.env.GENIE_API_KEY;
  const baseUrl = process.env.GENIE_BASE_URL || (process.env.GENIE_ENV === "production" ? "https://api.geniebiz.lk" : "https://sandbox-api.geniebiz.lk");

  console.log("--- Genie Configuration ---");
  console.log("GENIE_ENV:", env);
  console.log("GENIE_MERCHANT_ID:", merchant);
  console.log("GENIE_API_KEY:", apiKeySet ? mask(process.env.GENIE_API_KEY) : "MISSING");
  console.log("GENIE_BASE_URL:", baseUrl);

  if (!apiKeySet || !process.env.GENIE_MERCHANT_ID) {
    console.warn("⚠️ Genie configuration looks incomplete. Please verify Backend/.env and Genie dashboard settings.");
  }
};

// Import routes
import busRoutes from "./routes/busRoutes.js";
import conductorRoutes from "./routes/conductorRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import genieRoutes from "./routes/genieRoutes.js";

// Import Background Tasks
import { startReleaseInterval } from "./utils/releasePendingBookings.js";
import { startExpireCron } from "./expireBooking.js";

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/conductors", conductorRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/genie", genieRoutes);

// Health Check Endpoint
app.get("/", (req, res) => {
  res.json({ message: "✅ API is running successfully" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start Server and DB
const startServer = async () => {
  try {
    // Log Genie config early to help diagnose integration issues
    validateGenieConfig();
    // 1. Connect DB
    await connectDB();

    // 2. Start Background Tasks
    startReleaseInterval();
    startExpireCron();

    // 3. Start Listening
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Import routes
import busRoutes from "./routes/busRoutes.js";
import conductorRoutes from "./routes/conductorRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";

// Import Background Tasks
import { startReleaseInterval } from "./utils/releasePendingBookings.js";
import { startExpireCron } from "./expireBooking.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/conductors", conductorRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/owner", ownerRoutes);

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

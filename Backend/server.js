import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import busRoutes from "./routes/busRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/buses", busRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "✅ API is running" }));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
);

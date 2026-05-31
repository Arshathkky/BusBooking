import express from "express";
import { getDailyReport, getAggregatedReport } from "../controllers/reportController.js";

// Middleware
import { verifyToken, checkOwnership } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/daily", verifyToken, checkOwnership("ownerId"), getDailyReport);
router.get("/aggregated", verifyToken, checkOwnership("ownerId"), getAggregatedReport);

export default router;

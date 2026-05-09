import express from "express";
import { getDailyReport, getAggregatedReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/daily", getDailyReport);
router.get("/aggregated", getAggregatedReport);

export default router;

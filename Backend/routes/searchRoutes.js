import express from "express";
import { searchBuses } from "../controllers/searchController.js";

const router = express.Router();

// GET /api/search/buses?from=Colombo&to=Kandy
router.get("/buses", searchBuses);

export default router;

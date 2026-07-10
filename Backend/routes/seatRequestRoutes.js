import express from "express";
import {
  createSeatRequest,
  getSeatRequests,
  updateSeatRequest,
} from "../controllers/seatRequestController.js";

const router = express.Router();

// Public route to submit request
router.post("/", createSeatRequest);

// Dashboard routes (can add authMiddleware if needed, but keeping it flexible)
router.get("/", getSeatRequests);
router.patch("/:id", updateSeatRequest);

export default router;

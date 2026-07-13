import express from "express";
import {
  createBusRequest,
  getBusRequests,
  updateBusRequestStatus,
  deleteBusRequest
} from "../controllers/busRequestController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route to submit request
router.post("/", createBusRequest);

// Protected routes (admin/owner)
router.get("/", verifyToken, requireRole(["admin", "owner"]), getBusRequests);
router.patch("/:id/status", verifyToken, requireRole(["admin", "owner"]), updateBusRequestStatus);
router.delete("/:id", verifyToken, requireRole(["admin", "owner"]), deleteBusRequest);

export default router;

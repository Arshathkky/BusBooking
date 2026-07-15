import express from "express";
import {
  addBus,
  getBuses,
  getBusById,
  updateBus,
  deleteBus,
  toggleBusStatus,
  updateSeatLayout,
  assignConductorSeats,
  getConductorSeats,
  getSeatLayout,
  removeConductorSeats,
  updateSchedule,
  approvePendingChanges,
  rejectPendingChanges
} from "../controllers/busController.js";
import { verifyToken, checkOwnership, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ------------------------------
 * 🚌 Bus Management Routes
 * ------------------------------
 */
router.post("/", verifyToken, requireRole(["admin", "owner"]), addBus); // Add bus (with ladies + agent seats)
router.get("/", getBuses); // Get all buses (Public)
router.get("/:id", getBusById); // Get one bus (Public)
router.put("/:id", verifyToken, requireRole(["admin", "owner"]), updateBus); // Update bus details
router.delete("/:id", verifyToken, requireRole(["admin", "owner"]), deleteBus); // Delete bus
router.patch("/:id/status", verifyToken, requireRole(["admin", "owner"]), toggleBusStatus); 

router.patch("/:id/seats", verifyToken, updateSeatLayout);
router.put("/:id/conductor-seats", verifyToken, requireRole(["admin", "owner"]), assignConductorSeats);
router.get("/:id/conductor-seats", verifyToken, getConductorSeats);
router.get("/:id/layout", getSeatLayout); // Layout might need to be public for customers
router.patch("/:id/conductor-seats/remove", verifyToken, requireRole(["admin", "owner"]), removeConductorSeats);
router.put("/:id/schedule", verifyToken, requireRole(["admin", "owner"]), updateSchedule);
router.patch("/:id/approve-changes", verifyToken, requireRole(["admin", "owner"]), approvePendingChanges);
router.patch("/:id/reject-changes", verifyToken, requireRole(["admin", "owner"]), rejectPendingChanges);

export default router;

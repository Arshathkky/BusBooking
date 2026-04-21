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
  updateSchedule
} from "../controllers/busController.js";

const router = express.Router();

/**
 * ------------------------------
 * 🚌 Bus Management Routes
 * ------------------------------
 */
router.post("/", addBus); // Add bus (with ladies + agent seats)
router.get("/", getBuses); // Get all buses
router.get("/:id", getBusById); // Get one bus
router.put("/:id", updateBus); // Update bus details
router.delete("/:id", deleteBus); // Delete bus
router.patch("/:id/status", toggleBusStatus); 

router.patch("/:id/seats", updateSeatLayout);
router.put("/:id/conductor-seats", assignConductorSeats);
router.get("/:id/conductor-seats", getConductorSeats);
router.get("/:id/layout", getSeatLayout);
router.patch("/:id/conductor-seats/remove", removeConductorSeats);
router.put("/:id/schedule", updateSchedule);

export default router;

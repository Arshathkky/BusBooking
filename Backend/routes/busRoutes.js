import express from "express";
import {
  addBus,
  getBuses,
  getBusById,
  updateBus,
  updateSeatLayout,
  deleteBus,
  toggleBusStatus,
  getSeatLayout
} from "../controllers/busController.js";

const router = express.Router();

// --------------------
// Bus CRUD
// --------------------
router.post("/", addBus);                  // Add a new bus
router.get("/", getBuses);                 // Get all buses
router.get("/:id", getBusById);            // Get bus by ID
router.put("/:id", updateBus);             // Update bus details
router.delete("/:id", deleteBus);          // Delete bus
router.put("/:id/toggle", toggleBusStatus); // Toggle bus active/inactive

// --------------------
// Seat layout
// --------------------
router.get("/:id/layout", getSeatLayout);  // Fetch seat layout
router.put("/:id/layout", updateSeatLayout); // Update seat layout

export default router;

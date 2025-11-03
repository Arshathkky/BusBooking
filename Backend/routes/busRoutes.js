import express from "express";
import {
  addBus,
  getBuses,
  getBusById,
  updateBus,
  updateSeatLayout,
  deleteBus,
  toggleBusStatus,
  getSeatLayout,
} from "../controllers/busController.js";

const router = express.Router();

// --------------------
// Bus Routes
// --------------------

// ✅ Add new bus
router.post("/", addBus);

// ✅ Get all buses
router.get("/", getBuses);

// ✅ Get bus by ID
router.get("/:id", getBusById);

// ✅ Update bus details
router.put("/:id", updateBus);

// ✅ Update only seat layout
router.put("/:id/seats", updateSeatLayout);

// ✅ Delete bus
router.delete("/:id", deleteBus);

// ✅ Toggle bus status (active/inactive)
router.patch("/:id/status", toggleBusStatus);

// ✅ Get seat layout only (for frontend seat selection)
router.get("/:id/seats", getSeatLayout);

export default router;

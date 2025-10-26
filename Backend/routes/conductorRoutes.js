import express from "express";
import {
  createConductor,
  getConductorsByOwner,
  getConductorById,
  updateConductor,
  deleteConductor,
  toggleConductorStatus,
  getAllConductors,
} from "../controllers/conductorController.js";

const router = express.Router();

// Create new conductor
router.post("/", createConductor);

// Get all conductors for specific owner
router.get("/owner/:ownerId", getConductorsByOwner);    
router.get("/", getAllConductors);    

// Get single conductor
router.get("/:id", getConductorById);

// Update conductor
router.put("/:id", updateConductor);

// Delete conductor
router.delete("/:id", deleteConductor);

// Toggle conductor status
router.patch("/:id/toggle-status", toggleConductorStatus);

export default router;
    
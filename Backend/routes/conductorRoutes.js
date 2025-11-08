import express from "express";
import {
  createConductor,
  getConductorsByOwner,
  getConductorById,
  updateConductor,
  deleteConductor,
  toggleConductorStatus,
  getAllConductors,
  loginConductor,
} from "../controllers/conductorController.js";



const router = express.Router();

// Auth route
router.post("/login", loginConductor);

// CRUD routes
router.post("/", createConductor);
router.get("/owner/:ownerId", getConductorsByOwner);
router.get("/", getAllConductors);
router.get("/:id", getConductorById);
router.put("/:id", updateConductor);
router.delete("/:id", deleteConductor);
router.patch("/:id/toggle-status", toggleConductorStatus);

export default router;

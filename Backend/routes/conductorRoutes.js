import express from "express";
import {
  createConductor,
  getAllConductors,
  getConductorsByOwner,
  getConductorById,
  updateConductor,
  deleteConductor,
  toggleConductorStatus,
  loginConductor,
  getConductorCities,
  getConductorBus,
  getConductorSeats,
  getConductorDashboard
} from "../controllers/conductorController.js";

// Middleware
import { verifyToken, checkOwnership, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, requireRole(["admin", "owner"]), createConductor);
router.get("/", verifyToken, requireRole(["admin", "owner"]), getAllConductors);
router.get("/owner/:ownerId", verifyToken, checkOwnership("ownerId"), getConductorsByOwner);
router.get("/:id", verifyToken, checkOwnership("id"), getConductorById);
router.put("/:id", verifyToken, checkOwnership("id"), updateConductor);
router.delete("/:id", verifyToken, requireRole(["admin", "owner"]), deleteConductor);
router.patch("/:id/toggle", verifyToken, requireRole(["admin", "owner"]), toggleConductorStatus);
router.post("/login", loginConductor);
router.get("/conductor-cities/list", getConductorCities);
router.get("/conductor/:id/bus", verifyToken, checkOwnership("id"), getConductorBus);
router.get("/conductor-seats", verifyToken, getConductorSeats);
router.get("/dashboard/:conductorId", verifyToken, checkOwnership("conductorId"), getConductorDashboard);

export default router;
    
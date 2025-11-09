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
} from "../controllers/conductorController.js"; // <-- Must include `.js`

const router = express.Router();

// Routes
router.post("/", createConductor);
router.get("/", getAllConductors);
router.get("/owner/:ownerId", getConductorsByOwner);
router.get("/:id", getConductorById);
router.put("/:id", updateConductor);
router.delete("/:id", deleteConductor);
router.patch("/:id/toggle", toggleConductorStatus);
router.post("/login", loginConductor);

export default router;
    
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
   getConductorBus,       // ✅ added
  getConductorSeats,     // ✅ added
  getConductorDashboard  //
} from "../controllers/conductorController.js"; // <-- Must include `.js`

const router = express.Router();


router.post("/", createConductor);
router.get("/", getAllConductors);
router.get("/owner/:ownerId", getConductorsByOwner);
router.get("/:id", getConductorById);
router.put("/:id", updateConductor);
router.delete("/:id", deleteConductor);
router.patch("/:id/toggle", toggleConductorStatus);
router.post("/login", loginConductor);
router.get("/conductor-cities/list", getConductorCities);
router.get("/conductor/:id/bus", getConductorBus);
router.get("/conductor-seats", getConductorSeats);
router.get("/dashboard/:conductorId", getConductorDashboard);

export default router;
    
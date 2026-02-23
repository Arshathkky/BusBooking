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
   getAgentCities,
   getAgentBus,       // ✅ added
  getAgentSeats,     // ✅ added
  getAgentDashboard  //
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
router.get("/agent-cities/list", getAgentCities);
router.get("/agent/:id/bus", getAgentBus);
router.get("/agent-seats", getAgentSeats);
router.get("/dashboard/:agentId", getAgentDashboard);

export default router;
    
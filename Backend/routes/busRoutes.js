  import express from "express";
  import {
    addBus,
    getBuses,
    getBusById,
    updateBus,
    deleteBus,
    toggleBusStatus,
    updateSeatLayout,     // ✅ Add this
    assignAgentSeats,     // ✅ Add this
    getAgentSeats,        // ✅ Add this
    getSeatLayout,  
    removeAgentSeats ,
    holdSeats

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
  router.put("/:id/agent-seats", assignAgentSeats);

  router.get("/:id/agent-seats", getAgentSeats);
  router.get("/:id/layout", getSeatLayout);
  router.patch("/:id/agent-seats/remove", removeAgentSeats);
  router.put("/:id/hold-seats", holdSeats);


  export default router;

import express from "express";
import {
  addBus,
  getBuses,
  getBusById,
  updateSeatLayout,
  deleteBus,
} from "../controllers/busController.js";

const router = express.Router();

router.post("/", addBus);
router.get("/", getBuses);
router.get("/:id", getBusById);
router.put("/:id/layout", updateSeatLayout);
router.delete("/:id", deleteBus);

export default router;

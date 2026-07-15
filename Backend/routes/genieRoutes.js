import express from "express";
import { initiateGeniePayment, genieNotify, getGenieStatus, verifyGeniePayment } from "../controllers/genieController.js";

const router = express.Router();

router.post("/pay", initiateGeniePayment);
router.post("/notify", genieNotify);
router.get("/status", getGenieStatus);
router.get("/verify/:bookingId", verifyGeniePayment); // Manual verification

export default router;

import express from "express";
import { initiateGeniePayment, genieNotify, getGenieStatus } from "../controllers/genieController.js";

const router = express.Router();

router.post("/pay", initiateGeniePayment);
router.post("/notify", genieNotify);
router.get("/status", getGenieStatus);

export default router;

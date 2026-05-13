import express from "express";
import { initiateGeniePayment, genieNotify } from "../controllers/genieController.js";

const router = express.Router();

router.post("/pay", initiateGeniePayment);
router.post("/notify", genieNotify);

export default router;

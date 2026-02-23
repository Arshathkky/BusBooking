import express from "express";
import { verifyAgentCode } from "../controllers/agentController.js";

const router = express.Router();

// POST /api/agent/verify
router.post("/verify", verifyAgentCode);

export default router;
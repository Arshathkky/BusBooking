import express from "express";
import { verifyAgentCode } from "../controllers/busController.js"; // or agentController.js

const router = express.Router();

// POST /api/agents/verify
router.post("/verify", verifyAgentCode);

export default router;

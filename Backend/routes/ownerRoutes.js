import express from "express";
const router = express.Router();
import rateLimit from "express-rate-limit";

// Controllers
import * as ownerController from "../controllers/ownerController.js";
import * as overviewController from "../controllers/overviewController.js";

// Middleware
import { verifyToken, checkOwnership, requireRole } from "../middleware/authMiddleware.js";

// Rate limiter: max 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Owner login (public, rate-limited)
router.post("/login", loginLimiter, ownerController.loginOwner);

// CRUD operations
router.get("/", verifyToken, requireRole(["admin"]), ownerController.getOwners);
router.get("/:id", verifyToken, checkOwnership("id"), ownerController.getOwnerById);
router.get("/:id/details", verifyToken, checkOwnership("id"), ownerController.getOwnerDetails);
router.post("/", verifyToken, requireRole(["admin"]), ownerController.addOwner);
router.put("/:id", verifyToken, checkOwnership("id"), ownerController.updateOwner);
router.delete("/:id", verifyToken, requireRole(["admin"]), ownerController.deleteOwner);

router.get("/:id/overview", verifyToken, checkOwnership("id"), overviewController.getOwnerOverview);

export default router;

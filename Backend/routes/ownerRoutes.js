import express from "express";
const router = express.Router();

// Controllers
import * as ownerController from "../controllers/ownerController.js";
import * as overviewController from "../controllers/overviewController.js";

// Middleware
import { verifyToken, checkOwnership, requireRole } from "../middleware/authMiddleware.js";

// Owner login (public)
router.post("/login", ownerController.loginOwner);

// CRUD operations
router.get("/", verifyToken, requireRole(["admin"]), ownerController.getOwners);
router.get("/:id", verifyToken, checkOwnership("id"), ownerController.getOwnerById);
router.get("/:id/details", verifyToken, checkOwnership("id"), ownerController.getOwnerDetails);
router.post("/", verifyToken, requireRole(["admin"]), ownerController.addOwner);
router.put("/:id", verifyToken, checkOwnership("id"), ownerController.updateOwner);
router.delete("/:id", verifyToken, requireRole(["admin"]), ownerController.deleteOwner);

router.get("/:id/overview", verifyToken, checkOwnership("id"), overviewController.getOwnerOverview);

export default router;

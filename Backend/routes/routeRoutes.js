import express from "express";
import {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  toggleRouteStatus,
} from "../controllers/routeController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getRoutes);
router.get("/search", searchRoutes); // Public endpoint for searching routes
router.get("/:id", verifyToken, getRouteById);
router.post("/", verifyToken, requireRole(["admin", "owner"]), createRoute);
router.put("/:id", verifyToken, requireRole(["admin", "owner"]), updateRoute);
router.delete("/:id", verifyToken, requireRole(["admin", "owner"]), deleteRoute);
router.patch("/:id/toggle", verifyToken, requireRole(["admin", "owner"]), toggleRouteStatus);

export default router;

import express from "express";
import {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  toggleRouteStatus,
  searchRoutes,
} from "../controllers/routeController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getRoutes); // Public
router.get("/search", searchRoutes); // Public endpoint for searching routes
router.get("/:id", getRouteById); // Public
router.post("/", verifyToken, requireRole(["admin", "owner"]), createRoute);
router.put("/:id", verifyToken, requireRole(["admin", "owner"]), updateRoute);
router.delete("/:id", verifyToken, requireRole(["admin", "owner"]), deleteRoute);
router.patch("/:id/toggle", verifyToken, requireRole(["admin", "owner"]), toggleRouteStatus);

export default router;

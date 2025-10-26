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

const router = express.Router();

router.get("/", getRoutes);
router.get("/search", searchRoutes);
router.get("/:id", getRouteById);
router.post("/", createRoute);
router.put("/:id", updateRoute);
router.delete("/:id", deleteRoute);
router.patch("/:id/toggle", toggleRouteStatus);

export default router;

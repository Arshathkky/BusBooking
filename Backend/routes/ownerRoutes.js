import express from "express";
const router = express.Router();

// Controllers
import * as ownerController from "../controllers/ownerController.js";
import * as overviewController from "../controllers/overviewController.js";

// Owner login
router.post("/login", ownerController.loginOwner);

// CRUD operations
router.get("/", ownerController.getOwners);
router.get("/:id", ownerController.getOwnerById);
router.get("/:id/details", ownerController.getOwnerDetails);
router.post("/", ownerController.addOwner);
router.put("/:id", ownerController.updateOwner);
router.delete("/:id", ownerController.deleteOwner);


router.get("/:id/overview", overviewController.getOwnerOverview);


export default router;

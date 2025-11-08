const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/ownerController");

// Get all owners
router.get("/", ownerController.getOwners);

// Get single owner by ID
router.get("/:id", ownerController.getOwnerById);

// Get owner details with stats (buses, bookings, revenue, routes)
router.get("/:id/details", ownerController.getOwnerDetails);

// Add new owner
router.post("/", ownerController.addOwner);

// Update owner
router.put("/:id", ownerController.updateOwner);

// Delete owner
router.delete("/:id", ownerController.deleteOwner);

module.exports = router;

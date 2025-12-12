const express = require("express");
const router = express.Router();

// Controllers
const ownerController = require("../controllers/ownerController");
const overviewController = require("../controllers/overviewController");

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


module.exports = router;

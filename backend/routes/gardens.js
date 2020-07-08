const checkAuth = require("../middleware/check-auth");

const express = require("express");
const router = express.Router();

const gardenController = require("../controllers/garden");

router.post("", checkAuth, gardenController.createGarden);

router.put("/:id", checkAuth, gardenController.updateGarden);

router.get("", checkAuth, gardenController.getGardens);

router.get("/notification", checkAuth, gardenController.getNotificationGardens);

router.get("/:id", checkAuth, gardenController.getGarden);

router.delete("/:id", checkAuth, gardenController.deleteGarden);

router.put("/slot/:id", checkAuth, gardenController.updateSlot);

module.exports = router;

const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");

const express = require("express");
const router = express.Router();

const gardenController = require("../controllers/garden");

router.post("", checkAuth, gardenController.createGarden);

router.put("/:id", checkAuth, gardenController.updateGarden);

router.get("", checkAuth, gardenController.getGardens);

router.get("/:id", checkAuth, gardenController.getGarden);

router.delete("/:id", checkAuth, gardenController.deleteGarden);

module.exports = router;

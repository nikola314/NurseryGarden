const express = require("express");
const checkAuth = require("../middleware/check-auth");
const checkAdmin = require("../middleware/check-admin");

const userController = require("../controllers/user");

const router = express.Router();

router.post("/signup", userController.creteUser);

router.post("/login", userController.login);

router.post("/changePassword", checkAuth, userController.changePassword);

router.get("/pendingUsers", checkAuth, checkAdmin, userController.getUsers);

module.exports = router;
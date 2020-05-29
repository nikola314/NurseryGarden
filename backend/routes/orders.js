const checkAuth = require("../middleware/check-auth");
const checkOwner = require("../middleware/check-owner");

const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order");

router.get("/company", checkAuth, orderController.getCompanyOrders);

router.post("", checkAuth, orderController.createOrder);

router.get(
    "/userOrdered/:productId",
    checkAuth,
    orderController.getIsOrderedByUser
);

module.exports = router;
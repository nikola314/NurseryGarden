const checkAuth = require("../middleware/check-auth");
const checkOwner = require("../middleware/check-owner");

const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order");

router.get("/company", checkAuth, orderController.getCompanyOrders);

router.get("/stats", checkAuth, orderController.getStatisticsData);

router.get("/pdf-stats", checkAuth, orderController.getPDFData);

router.post("", checkAuth, orderController.createOrder);

router.get(
    "/userOrdered/:productId",
    checkAuth,
    orderController.getIsOrderedByUser
);

router.get("/couriers", checkAuth, orderController.getCourierDistance);

router.post("/accept", checkAuth, orderController.acceptOrder);

router.post("/deny", checkAuth, orderController.denyOrder);

module.exports = router;

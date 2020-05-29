const checkAuth = require("../middleware/check-auth");
const checkOwner = require("../middleware/check-owner");

const express = require("express");
const router = express.Router();

const productController = require("../controllers/product");

router.delete("/:id", checkAuth, checkOwner, productController.deleteProduct);

router.put("/:id", checkAuth, checkOwner, productController.updateProduct);

router.post("", checkAuth, productController.createProduct);

router.get("/company/:id", checkAuth, productController.getCompanyProducts);

router.get("/:id", checkAuth, productController.getProduct);

router.get("", productController.getProducts);

module.exports = router;
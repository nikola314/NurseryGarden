const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

const mongoose = require("mongoose");


exports.getCompanyOrders = (req, res, next) => {
    // TODO: populate fields?
    const manufacturer = req.userData.userId;
    Order.find()
        .populate({
            path: "product",
            match: {
                manufacturer: manufacturer
            }
        }).then((orders) => {
            orders = orders.filter((order) => {
                return order.product;
            });
            res.status(200).json({
                message: "Orders fetched successfully!",
                orders: orders,
            });

        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                message: "Getting orders failed!",
            });
        })
}
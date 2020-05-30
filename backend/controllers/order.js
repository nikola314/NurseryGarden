const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const Garden = require("../models/garden");

const mongoose = require("mongoose");

exports.getCompanyOrders = (req, res, next) => {
    // TODO: populate fields?
    const manufacturer = req.userData.userId;
    Order.find()
        .populate({
            path: "product",
            match: {
                manufacturer: manufacturer,
            },
        })
        .then((orders) => {
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
        });
};

exports.getIsOrderedByUser = (req, res, next) => {
    let productId = req.params.productId;
    let userId = req.userData.userId;
    Order.find({ product: productId, isDelivered: true })
        .populate({
            path: "garden",
            match: {
                owner: userId,
            },
        })
        .then((orders) => {
            let isOrdered = false;
            orders = orders.filter((order) => {
                return order.garden;
            });
            if (orders.length > 0) {
                isOrdered = true;
            }
            res.status(200).json({
                message: "User did order this product!",
                canComment: isOrdered,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                message: "Getting orders failed!",
            });
        });
};

exports.createOrder = (req, res, next) => {
    var order = new Order({
        product: mongoose.Types.ObjectId(req.body.product),
        isDelivered: req.body.isDelivered,
        garden: mongoose.Types.ObjectId(req.body.garden),
        isPickedUp: req.body.isPickedUp,
        timestamp: req.body.timestamp,
        count: req.body.count,
    });
    order
        .save()
        .then((createdOrder) => {
            Garden.findById(createdOrder.garden)
                .then((garden) => {
                    garden.orders.push(createdOrder._id);
                    garden
                        .save()
                        .then((garden) => {
                            res.status(201).json({
                                message: "Order created successfully",
                                order: createdOrder,
                            });
                        })
                        .catch(errorFunction);
                })
                .catch(errorFunction);
        })
        .catch(errorFunction);
};

errorFunction = (err) => {
    res.status(500).json({
        message: "Creating order failed!",
    });
    console.log(err);
};

exports.getStatisticsData = (req, res, next) => {
    var today = new Date(),
        oneDay = 1000 * 60 * 60 * 24,
        thirtyDays = new Date(today.valueOf() - 30 * oneDay);

    Order.aggregate([{
                $match: {
                    timestamp: { $gte: thirtyDays },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$timestamp" },
                        day: { $dayOfMonth: "$timestamp" },
                        year: { $year: "$timestamp" },
                    },
                    count: { $sum: 1 },
                    date: { $first: "$timestamp" },
                },
            },
            {
                $project: {
                    date: {
                        $dateToString: { format: "%Y-%m-%d", date: "$date" },
                    },
                    count: 1,
                    _id: 0,
                },
            },
        ])
        .sort({ date: 1 })
        .then((result) => {
            res.status(201).json({
                message: "Stats calculated successfully",
                stats: result,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Calculating stats failed!",
            });
            console.log(err);
        });
};
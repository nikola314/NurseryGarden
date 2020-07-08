const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const Garden = require("../models/garden");
var distance = require("google-distance-matrix");

const mongoose = require("mongoose");
const Courier = require("../models/courier");
const product = require("../models/product");

// Testing distance matrix api
exports.getCourierDistance = (req, res, next) => {
    distance.key("AIzaSyBX68PfCfs6tuA0FETqRIt5INrWpcjEtcY");
    var origins = ["Jastrebacka 47 Beograd"];
    var destinations = ["Franca Jankea 3 Beograd"];
    distance.matrix(origins, destinations, (err, distances) => {
        if (err) {
            console.log(err);
        } else {
            console.log(distances);
            console.log(distances.rows[0].elements);
        }
        res.status(200).json({
            message: "Maps!",
            distances: distances,
        });
    });
};

exports.deliverPackage = (courier) => {
    Order.find({
            status: "accepted",
            isPickedUp: true,
            isDelivered: false,
            indentNumber: courier.indentNumber,
        })
        .populate({
            path: "product",
            match: {
                manufacturer: courier.company._id,
            },
        })
        .then((orders) => {
            var promises = [];
            let ords = orders;
            let garden = orders[0].garden;
            for (let order of orders) {
                if (
                    mongoose.Types.ObjectId(courier.company._id).equals(
                        order.product.manufacturer
                    )
                ) {
                    var promise = Order.updateOne({ _id: order._id }, { $set: { isDelivered: true } });
                    promises.push(promise);
                }
            }
            Promise.all(promises).then((params) => {
                Garden.findById(garden).then((garden) => {
                    for (let order of ords) {
                        let productId = order.product._id;
                        let index = garden.warehouse.findIndex((el) =>
                            mongoose.Types.ObjectId(el.product).equals(productId)
                        );
                        if (index != -1) {
                            garden.warehouse[index].count += order.count;
                        } else {
                            garden.warehouse.push({
                                product: order.product._id,
                                count: order.count,
                            });
                        }
                    }
                    garden.save().then((garden) => {
                        Courier.updateOne({ _id: courier._id }, { $set: { status: 0 } }).then((params) => {
                            this.pickUpAndDeliverPackage(courier.company._id);
                        });
                    });
                });
            });
        });
};

exports.pickUpAndDeliverPackage = (companyId) => {
    Courier.find({ company: companyId, status: 0 })
        .populate("company")
        .then((couriers) => {
            if (couriers.length == 0) return;
            let courier = couriers[0];
            let origin = courier.company.location;
            Order.find({ status: "accepted", isPickedUp: false, isDelivered: false })
                .populate({
                    path: "product",
                    match: {
                        manufacturer: companyId,
                    },
                })
                .populate("garden")
                .then((orders) => {
                    if (orders.length == 0) {
                        console.log("returned");
                        return;
                    }

                    let selectedOrder = orders[0];
                    let destination = selectedOrder.garden.location;
                    let indentNumber = selectedOrder.indentNumber;
                    var promises = [];
                    for (let order of orders) {
                        if (
                            order.indentNumber == indentNumber &&
                            mongoose.Types.ObjectId(companyId).equals(
                                order.product.manufacturer
                            )
                        ) {
                            var promise = Order.updateOne({ _id: order._id }, { $set: { isPickedUp: true } });
                            promises.push(promise);
                        }
                    }
                    Promise.all(promises).then((params) => {
                        Courier.updateOne({ _id: courier._id }, { $set: { indentNumber: indentNumber, status: 1 } }).then((params) => {
                            distance.key("AIzaSyBX68PfCfs6tuA0FETqRIt5INrWpcjEtcY");
                            var origins = [origin];
                            var destinations = [destination];
                            distance.matrix(origins, destinations, (err, distances) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    let timeToDeliverMS =
                                        distances.rows[0].elements[0].duration.value * 1000 * 2; // *2 bcs both directions
                                    // setTimeout(this.deliverPackage, timeToDeliverMS, courier);
                                    console.log(
                                        "Picked up! Time to deliver: " + timeToDeliverMS + "ms"
                                    );
                                    setTimeout(this.deliverPackage, 5000, courier);
                                }
                            });
                        });
                    });
                });
        });
};

exports.acceptOrder = (req, res, next) => {
    const company = mongoose.Types.ObjectId(req.userData.userId);

    Order.find({ indentNumber: req.body.indentNumber })
        .populate({
            path: "product",
            match: {
                manufacturer: company,
            },
        })
        .then((orders) => {
            var promises = [];
            for (let order of orders) {
                var promise = Order.updateOne({ _id: order._id }, { $set: { status: "accepted" } });
                promises.push(promise);
            }
            Promise.all(promises)
                .then((params) => {
                    Courier.find({ company: company, status: 0 })
                        .populate("company")
                        .then((couriers) => {
                            if (couriers.length != 0) {
                                this.pickUpAndDeliverPackage(company);
                            }
                            res.status(200).json({
                                message: "Order accepted successfully! " + orders.length,
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                            res.status(500).json({
                                message: "Getting orders failed!",
                            });
                        });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        message: "Getting orders failed!",
                    });
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                message: "Getting orders failed!",
            });
        });
};

exports.denyOrder = (req, res, next) => {
    const company = mongoose.Types.ObjectId(req.userData.userId);
    Order.find({ indentNumber: req.body.indentNumber })
        .populate({
            path: "product",
            match: {
                manufacturer: company,
            },
        })
        .then((orders) => {
            var promises = [];
            for (let order of orders) {
                let productId = order.product._id;
                let available = order.product.available + order.count;
                var promise = Order.collection.remove({ _id: order._id });
                promises.push(promise);
                promise = Product.updateOne({ _id: productId }, { $set: { available: available } });
                promises.push(promise);
            }
            Promise.all(promises)
                .then((params) => {
                    res.status(200).json({
                        message: "Order deleted successfully! " + orders.length,
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        message: "Getting orders failed!",
                    });
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                message: "Getting orders failed!",
            });
        });
};

exports.getCompanyOrders = (req, res, next) => {
    const manufacturer = req.userData.userId;
    Order.find()
        .populate({
            path: "product",
            match: {
                manufacturer: manufacturer,
            },
        })
        .then((orders) => {
            let response = [];
            for (let order of orders) {
                if (!response[order.indentNumber]) {
                    response[order.indentNumber] = {
                        products: "",
                        count: 0,
                        isDelivered: order.isDelivered,
                        isPickedUp: order.isPickedUp,
                        timestamp: order.timestamp,
                        status: order.status,
                    };
                }
                if (response[order.indentNumber].count != 0)
                    response[order.indentNumber].products += ", ";
                response[order.indentNumber].products +=
                    order.product.name + " x" + order.count;
                response[order.indentNumber].count += order.count;
            }

            var retVal = [];
            for (var n in response) {
                let obj = {
                    products: response[n].products,
                    count: response[n].count,
                    indentNumber: n,
                    isDelivered: response[n].isDelivered,
                    isPickedUp: response[n].isPickedUp,
                    timestamp: response[n].timestamp,
                    status: response[n].status,
                };
                retVal.push(obj);
            }

            res.status(200).json({
                message: "Orders fetched successfully!",
                orders: retVal,
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
        indentNumber: req.body.indentNumber,
    });

    Product.findById(req.body.product).then((product) => {
        product.available = product.available - req.body.count;
        if (product.available < 0) {
            res.status(500).json({
                message: "Creating order failed!",
            });
        } else {
            product.save().then((product) => {
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
            });
        }
    });
};

errorFunction = (err) => {
    res.status(500).json({
        message: "Creating order failed!",
    });
    console.log(err);
};

exports.getPDFData = (req, res, next) => {
    // for each order: product list, total price, name of farmer, garden location
    const manufacturer = req.userData.userId;
    Order.find({ isDelivered: true })
        .populate({
            path: "product",
            match: {
                manufacturer: manufacturer,
            },
        })
        .populate("garden")
        .then((orders) => {
            let response = [];
            for (let order of orders) {
                if (!response[order.indentNumber]) {
                    response[order.indentNumber] = {
                        products: [],
                        client: order.garden.owner,
                        location: order.garden.location,
                    };
                }

                response[order.indentNumber].products.push({
                    product: order.product.name,
                    count: order.count,
                    price: order.product.price,
                });
            }

            var retVal = [];
            for (var n in response) {
                let obj = {
                    products: response[n].products,
                    indentNumber: n,
                    client: response[n].client,
                    location: response[n].location,
                };
                retVal.push(obj);
            }

            res.status(200).json({
                message: "Orders fetched successfully!",
                stats: retVal,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                message: "Getting orders failed!",
            });
        });
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

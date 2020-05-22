const Garden = require("../models/garden");
const Slot = require("../models/slot");
const Product = require("../models/product");
const Order = require("../models/order");
const mongoose = require("mongoose");

exports.createGarden = (req, res, next) => {
    const userId = req.userData.userId;
    var garden = new Garden({
        name: req.body.name,
        location: req.body.location,
        width: req.body.width,
        height: req.body.height,
        occupied: 0,
        temperature: 18,
        water: 200,
        owner: userId,
        slots: [],
        orders: [],
    });
    let slots = [];
    for (let i = 0; i < req.body.height; i++) {
        for (let j = 0; j < req.body.width; j++) {
            var slot = new Slot({
                product: null,
                positionX: j,
                positionY: i,
                timePlanted: null,
                garden: mongoose.Types.ObjectId(garden._id),
            });
            slots.push(slot);
            garden.slots.push(slot);
        }
    }
    Slot.collection.insert(slots, function(err, docs) {
        if (err) {
            return console.error(err);
        }
    });

    garden
        .save()
        .then((createdGarden) => {
            res.status(201).json({
                message: "Garden added successfully",
                post: {
                    ...createdGarden,
                    id: createdGarden._id,
                },
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Creating garden failed!",
            });
            console.log(err);
        });
};

exports.updateGarden = (req, res, next) => {
    Garden.findById(req.params.id).then((garden) => {
        if (garden.owner != req.userData.userId) {
            res.status(401).json({ message: "Not authorized!" });
        } else {
            (garden.warehouse = req.body.warehouse),
            (garden.temperature = req.body.temperature);
            garden.occupied = req.body.occupied;
            garden.water = req.body.water;
            garden
                .save()
                .then((result) => {
                    res.status(201).json({
                        message: "Garden updated successfully",
                        garden: garden,
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        message: "Updating failed!",
                    });
                });
        }
    });
};

exports.updateSlot = (req, res, next) => {
    let retSlot;
    Slot.findById(req.params.id).then((slot) => {
        slot.product = mongoose.Types.ObjectId(req.body.product);
        // if (slot.timePlanted == null) {
        slot.timePlanted = req.body.timePlanted;
        // }
        retSlot = slot;
        slot
            .save()
            .then((result) => {
                Product.findById(retSlot.product).then((prd) => {
                    retSlot.product = prd;
                    res.status(201).json({
                        message: "Slot updated successfully",
                        slot: retSlot,
                    });
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    message: "Updating failed!",
                });
            });
    });
};

exports.getGardens = (req, res, next) => {
    const userId = req.userData.userId;
    Garden.find({ owner: userId })
        .then((documents) => {
            res.status(200).json({
                message: "Gardens fetched successfully!",
                gardens: documents,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Fetching gardens failed!",
            });
        });
};

exports.getGarden = (req, res, next) => {
    Garden.findById(req.params.id)
        .populate({
            path: "slots",
            populate: {
                path: "product",
                model: "Product",
            },
        })
        .populate("warehouse.product")
        .populate("orders")
        .populate({
            path: "orders",
            populate: {
                path: "product",
                model: "Product"
            }
        })
        .then((garden) => {
            if (garden.owner != req.userData.userId) {
                res.status(401).json({ message: "Not authorized!" });
            } else {
                res.status(200).json({
                    message: "Garden fetched successfully!",
                    garden: garden,
                });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                message: "Fetching gardens failed!",
            });
        });
};

exports.deleteGarden = (req, res, next) => {
    // delete
};
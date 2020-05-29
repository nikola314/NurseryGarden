const Product = require("../models/product");
const User = require("../models/user");

const mongoose = require("mongoose");

exports.createProduct = (req, res, next) => {
    const userId = req.userData.userId;
    var product = new Product({
        name: req.body.name,
        isPlant: req.body.isPlant,
        manufacturer: mongoose.Types.ObjectId(userId),
        available: req.body.available,
        time: req.body.time,
        price: req.body.price,
        comments: [],
    });
    product
        .save()
        .then((createdProduct) => {
            res.status(201).json({
                message: "Product created successfully",
                product: createdProduct,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Creating product failed!",
            });
            console.log(err);
        });
};

exports.deleteProduct = (req, res, next) => {
    // TODO implement
};

exports.updateProduct = (req, res, next) => {
    Product.findById(req.params.id)
        .then((product) => {
            if (product.manufacturer != req.userData.userId) {
                res.status(401).json({ message: "Not authorized!" });
            } else {
                product.time = req.body.time;
                product.available = req.body.available;
                product.name = req.body.name;
                product.isPlant = req.body.isPlant;
                product.price = req.body.price;
                if (req.body.comments) {
                    product.comments = req.body.comments
                }
                product.save().then((result) => {
                    res.status(201).json({
                        message: "Product updated successfully",
                        product: product,
                    });
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "Updating failed!",
            });
        });
};

exports.getCompanyProducts = (req, res, next) => {
    // TODO: populate fields?
    const manufacturer = req.params.id;
    Product.find({ manufacturer: manufacturer })
        .then((products) => {
            res.status(200).json({
                message: "Products fetched successfully!",
                products: products,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                message: "Getting products failed!",
            });
        });
};

exports.getProduct = (req, res, next) => {
    Product.findById(req.params.id)
        .populate("comments.user")
        .populate("manufacturer")
        .then((product) => {
            res.status(200).json({
                message: "Product fetched successfully!",
                product: product,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                message: "Fetching product failed!",
            });
        });
};

exports.getProducts = (req, res, next) => {
    Product.find({})
        .populate("comments.user")
        .populate("manufacturer")
        .then((products) => {
            res.status(200).json({
                message: "Products fetched successfully!",
                products: products,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                message: "Fetching products failed!",
            });
        });
};
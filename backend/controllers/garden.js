const Garden = require('../models/garden');
const mongoose = require('mongoose');

exports.createGarden = (req, res, next) => {

}

exports.updateGarden = (req, res, next) => {

}

exports.getGardens = (req, res, next) => {
    const userId = req.userData.userId;
    Garden.find({ owner: userId })
        .then(documents => {
            res.status(200).json({
                message: "Gardens fetched successfully!",
                gardens: documents
            });
        }).catch((err) => {
            res.status(500).json({
                message: "Fetching gardens failed!"
            });
        });
}

exports.getGarden = (req, res, next) => {

}

exports.deleteGarden = (req, res, next) => {

}
const Garden = require('../models/garden');
const mongoose = require('mongoose');

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
        owner: userId
    });
    garden.save()
        .then(createdGarden => {
            res.status(201).json({
                message: "Garden added successfully",
                post: {
                    ...createdGarden,
                    id: createdGarden._id
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                message: "Creating garden failed!",

            });
            console.log(err);
        });
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
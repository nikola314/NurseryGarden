const mongoose = require("mongoose");

const gardenSchema = mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    water: { type: Number, reuqired: true },
    temperature: { type: Number, reuqired: true },
    occupied: { type: Number, reuqired: true },
    width: { type: Number, reuqired: true },
    height: { type: Number, reuqired: true },
    owner: { type: String, required: true }
});

module.exports = mongoose.model("Garden", gardenSchema);
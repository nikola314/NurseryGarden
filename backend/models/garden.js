const mongoose = require("mongoose");

const gardenSchema = mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    water: { type: Number, reuqired: true },
    temperature: { type: Number, reuqired: true },
    occupied: { type: Number, reuqired: true },
    width: { type: Number, reuqired: true },
    height: { type: Number, reuqired: true },
    owner: { type: String, required: true },
    slots: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
    }, ],
    warehouse: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        count: { type: Number, required: true, default: 0 },
    }, ],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }]
});

module.exports = mongoose.model("Garden", gardenSchema);
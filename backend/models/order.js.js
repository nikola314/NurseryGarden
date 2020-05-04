const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    count: { type: Number, default: 0 },
    isDelivered: { type: Boolean, required: true, default: false },
    isPickedUp: { type: Boolean, required: true, default: false }, // if it is in transport
    garden: { type: mongoose.Schema.Types.ObjectId, ref: "Garden", required: true },
    timestamp: { type: Date, required: true }
});

module.exports = mongoose.model("Order", orderSchema);
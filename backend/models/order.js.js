const mongoose = require("mongoose");

var SingleOrderSchema = new Schema({
    product: { type: String, required: true },
    count: { type: Number, default: 0 }
});

const orderSchema = mongoose.Schema({
    orders: [SingleOrderSchema],
    isDelivered: { type: Boolean, required: true, default: false },
    garden: { type: String, required: true }
});

module.exports = mongoose.model("Order", orderSchema);
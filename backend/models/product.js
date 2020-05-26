const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    isPlant: { type: Boolean, required: true },
    manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    time: { type: Number, required: true },
    available: { type: Number, required: true },
    price: { type: Number, required: true },
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: { type: String, required: true },
        grade: { type: Number, required: true }
    }]
});

productSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Product", productSchema);
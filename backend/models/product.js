const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    isPlant: { type: Boolean, required: true },
    manufacturer: { type: String, required: true },
    time: { type: Number, required: true },
});

productSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Product", productSchema);
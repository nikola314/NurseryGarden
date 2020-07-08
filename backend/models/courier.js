const mongoose = require("mongoose");

const courierSchema = mongoose.Schema({
    indentNumber: {
        type: String,
        default: null,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    timestamp: { type: Date, required: true }, // needed?
    status: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("Courier", courierSchema);

const mongoose = require("mongoose");

const slotSchema = mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, default: null },
    timePlanted: { type: Date, required: true },
    positionX: { type: Number, required: true },
    positionY: { type: Number, required: true },
    garden: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Garden"
    }
});


module.exports = mongoose.model("Slot", slotSchema);
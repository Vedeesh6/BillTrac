const mongoose = require("mongoose");

const subadminSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "Enabled",
    },
});

module.exports = mongoose.model("SubAdmin", subadminSchema);
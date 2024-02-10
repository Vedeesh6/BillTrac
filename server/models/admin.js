const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    id: String,
    password: String,
    email: String,
});

module.exports = mongoose.model("Admin", adminSchema);
const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
    billNumber: {
        type: String,
        unique: true,
        required: true,
    },
    billType: {
        type: String,
        required: true,
    },
    personEIS: {
        type: String,
        required: true,
    },
    personName: {
        type: String,
        required: true,
    },
    personEmail: {
        type: String,
        required: true,
    },
    personPhoneNumber: {
        type: String,
        required: true,
    },
    submissionDate: {
        type: String,
        required: true,
    },
    lastEditedDate: {
        type: String,
        required: true,
    },
    registeringDepartment: {
        type: String,
        required: true,
    },
    currentDepartment: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Bill", billSchema);
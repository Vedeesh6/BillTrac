const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  id: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Add a counter field for each department
  counter: {
    type: Number,
    default: 0,
  },
  // Add a status field for each department
  status: {
    type: String,
    default: "Enabled",
  },
});

module.exports = mongoose.model("Department", departmentSchema);
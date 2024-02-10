const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    EIS: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
});
  
module.exports = mongoose.model("Employee", employeeSchema);
const express = require("express");
const router = express.Router();
const Department = require("../models/department");

// Route to register a new department
router.post("/register", async (req, res) => {
  const { name, id, password } = req.body;

  try {
    // Check if a department with the same name already exists
    const existingName = await Department.findOne({ name });
    if (existingName) {
      return res.status(400).json({ success: false, message: "Department with the same name already exists" });
    }

    // Check if a department with the same ID already exists
    const existingId = await Department.findOne({ id });
    if (existingId) {
      return res.status(400).json({ success: false, message: "Department with the same ID already exists" });
    }

    // Create a new department
    const newDepartment = new Department({
      name,
      id,
      password,
      counter: 0, // Initialize the counter to 0
    });

    // Save the new department to the database
    const savedDepartment = await newDepartment.save();

    res.status(201).json({ success: true, message: "Department registered successfully", department: savedDepartment });
  } catch (error) {
    console.error("Error during department registration:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Fetch all departments
router.get("/edit", async (req, res) => {
  try {
    //Fetch all fields except password
    const departments = await Department.find({}, { password: 0 });
    res.json({ success: true, departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Fetch details of a specific department
router.get("/edit/:departmentName", async (req, res) => {
  const { departmentName } = req.params;
  try {
    const departmentDetails = await Department.findOne({ name: departmentName });
    if (!departmentDetails) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    res.json({ success: true, departmentDetails });
  } catch (error) {
    console.error("Error fetching department details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update the password of a specific department
router.put("/edit/:departmentName", async (req, res) => {
  const { departmentName } = req.params;
  const { newPassword } = req.body;
  try {
    // Update the password in the database
    const updatedDepartment = await Department.findOneAndUpdate(
      { name: departmentName },
      { password: newPassword },
      { new: true } // Return the updated document
    );

    if (!updatedDepartment) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.json({ success: true, message: "Password updated successfully", departmentDetails: updatedDepartment });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Deactivate a specific department
router.put("/deactivate/:departmentName", async (req, res) => {
  const { departmentName } = req.params;
  try {
    const deactivatedDepartment = await Department.findOneAndUpdate(
      { name: departmentName },
      { $set: { status: "Disabled" } },
      { new: true }
    );

    if (!deactivatedDepartment) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.json({ success: true, message: "Department deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating department:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Activate a specific department
router.put("/activate/:departmentName", async (req, res) => {
  const { departmentName } = req.params;
  try {
    const activatedDepartment = await Department.findOneAndUpdate(
      { name: departmentName },
      { $set: { status: "Enabled" } },
      { new: true }
    );

    if (!activatedDepartment) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.json({ success: true, message: "Department activated successfully" });
  } catch (error) {
    console.error("Error activating department:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
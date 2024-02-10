const express = require("express");
const router = express.Router();
const Employee = require("../models/employee");

// Register new employee
router.post("/register", async (req, res) => {
    const { EIS, name, email, phone} = req.body;
    try{
        // Check if employee id is num
        const employeeExists = await Employee.findOne({ EIS });
        if(employeeExists){
            return res.status(400).json({ success: false, message: "Employee ID already exists" });
        }
        const employee = await Employee.create({ EIS, name, email, phone});
        res.json({ success: true, message: "Employee registered successfully", employee: employee });
    } catch (error) {
        console.error("Error registering employee:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// Fetch specific employee by EIS
router.get("/:EIS", async (req, res) => {
    const { EIS } = req.params;
    try{
        const employee = await Employee.findOne({ EIS });
        if(!employee){
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        res.json({ success: true, employee: employee });
    } catch (error) {
        console.error("Error fetching employee details:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Edit employee details
router.put("/edit/:EIS", async (req, res) => {
    const { EIS } = req.params;
    const { name, email, phone } = req.body;
    try{
        const employee = await Employee.findOne({ EIS });
        if(!employee){
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        employee.name = name;
        employee.email = email;
        employee.phone = phone;
        await employee.save();
        res.json({ success: true, message: "Employee details updated successfully", employee: employee });
    } catch (error) {
        console.error("Error updating employee details:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Delete employee
router.delete("/delete/:EIS", async (req, res) => {
    const { EIS } = req.params;
    try{
        const employee = await Employee.findOneAndDelete({ EIS });
        if(!employee){
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        res.json({ success: true, message: "Employee deleted successfully" });
    } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
    

module.exports = router;
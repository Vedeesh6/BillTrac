const express = require("express");
const router = express.Router();
const SubAdmin = require("../models/subadmin");

let sid="subadmin";

// Route to fetch subadmin details
router.get("/fetch", async (req, res) => {
    try {
        const subadmin = await SubAdmin.findOne({ id: sid });
        if (!subadmin) {
            return res.status(404).json({ success: false, message: "Subadmin not found" });
        }
        res.json({ success: true, subadminDetails: subadmin });
    } catch (error) {
        console.error("Error fetching subadmin details:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Route to update subadmin password
router.put("/edit", async (req, res) => {
    const { newPassword } = req.body;

    try {
        const updateDept = await SubAdmin.findOneAndUpdate({ id: sid }, { password: newPassword }, { new: true });
        if (!updateDept) {
            return res.status(404).json({ success: false, message: "Subadmin not found" });
        }
        res.json({ success: true, message: "Subadmin password updated successfully" });
    } catch (error) {
        console.error("Error updating subadmin password:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Route to deactivate subadmin
router.put("/deactivate", async (req, res) => {
    try{
        const deactivateDept = await SubAdmin.findOneAndUpdate({ id: sid }, { $set: { status: "Disabled" } }, { new: true });
        if (!deactivateDept) {
            return res.status(404).json({ success: false, message: "Subadmin not found" });
        }
        res.json({ success: true, message: "Subadmin deactivated successfully" });
    }
    catch(error){
        console.error("Error deactivating subadmin:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Route to activate subadmin
router.put("/activate", async (req, res) => {
    try{
        const activateDept = await SubAdmin.findOneAndUpdate({ id: sid }, { $set: { status: "Enabled" } }, { new: true });
        if (!activateDept) {
            return res.status(404).json({ success: false, message: "Subadmin not found" });
        }
        res.json({ success: true, message: "Subadmin activated successfully" });
    }
    catch(error){
        console.error("Error activating subadmin:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;
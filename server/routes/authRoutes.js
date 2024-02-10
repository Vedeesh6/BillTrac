const express = require("express");
const router = express.Router();
const twilio = require('twilio');
const Admin = require("../models/admin");
const SubAdmin = require("../models/subadmin");
const Department = require("../models/department");
const nodemailer = require("nodemailer");

// In-memory store for OTPs with expiration time
const otpStore = new Map();
const myemail = "nclnigahibts@gmail.com";
const password = "admb qrci lwst zuwp";

// Nodemailer transporter setup (replace with your email configuration)
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: myemail,
    pass: password,
  },
});

// Function to send email
const sendEmail = async (to, subject, text) => {
    const mailOptions = {
      from: myemail,
      to,
      subject,
      text,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
};

// const accountSid = '';
// const authToken = '';
// const fromPhoneNumber = '';

// const client = twilio(accountSid, authToken);

// // Function to send SMS
// const sendSMS = async (to, message) => {
//   try {
//     await client.messages.create({
//       body: message,
//       from: fromPhoneNumber,
//       to,
//     });
//     console.log("SMS sent successfully");
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//     throw error; // Rethrow the error for the calling function to handle
//   }
// };

let id = "admin";

router.post("/login", async (req, res) => {
    const { id, password, accountType } = req.body;

    try {
        let user, name=null;
    
        if (accountType === "Admin") {
          user = await Admin.findOne({ id });
        } else if (accountType === "Department") {
          const deptuser = await Department.findOne({ id });
          if(deptuser){
            name = deptuser.name;
            user = deptuser;
          }
        } else if (accountType === "SubAdmin") {
          const subadmin = await SubAdmin.findOne({ id });
          if(subadmin){
            name = subadmin.name;
            user = subadmin;
          }
        }
    
        if (user) {
          const passwordMatch = password === user.password;
    
          if (passwordMatch) {
            // Check if the account is disabled
            if (user.status === "Disabled") {
              return res.status(401).json({ success: false, message: "Your account has been disabled. Please contact the admin" });
            }
            else{
              // Successful login
              res.status(200).json({ success: true, message: "Login successful", name: name });
            }
          } else {
            // Invalid credentials
            res.status(401).json({ success: false, message: "Invalid password" });
          }
        } else {
          // User not found
          res.status(401).json({ success: false, message: "User not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
});

router.post("/forgot-password", async (req, res) => {

  try {
    // Find the admin user by ID
    const admin = await Admin.findOne({ id });

    if (!admin) {
      // Admin not found
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store the OTP in memory with a 5-minute expiration time
    otpStore.set(id, { otp });
    setTimeout(() => otpStore.delete(id), 5 * 60 * 1000); // 5 minutes in milliseconds

    // Send OTP to admin's email
    const emailSubject = "Forgot Password OTP";
    const emailText = `Your OTP for password reset is: ${otp}`;

    await sendEmail(admin.email, emailSubject, emailText);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Route to validate the entered OTP
router.post("/validate-otp", (req, res) => {
  const { otp } = req.body;

  // Retrieve admin ID from your authentication logic
  const adminId = id; // Replace with your logic to get admin ID

  const storedOtp = otpStore.get(adminId);

  if (storedOtp && storedOtp.otp === otp) {
    // Valid OTP
    res.status(200).json({ success: true, message: "OTP is valid" });
  } else {
    // Invalid OTP
    res.status(401).json({ success: false, message: "Invalid OTP" });
  }
});

router.post("/change-password", async (req, res) => {
      const { newPassword } = req.body;
    
      try {
        // Find the admin user by ID
        const admin = await Admin.findOne({ id });
    
        if (!admin) {
          // Admin not found
          return res
            .status(404)
            .json({ success: false, message: "Admin not found" });
        }
    
        // Update the password
        admin.password = newPassword;
        await admin.save();
    
        res.status(200).json({ success: true, message: "Password updated" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
});

let sid = "subadmin";

// Route to change password for a subadmin
router.post("/subadmin/change-password", async (req, res) => {
  const {newPassword } = req.body;

  try {
    // Find the subadmin user by ID
    const subadmin = await SubAdmin.findOne({ sid });

    if (!subadmin) {
      // Subadmin not found
      return res
        .status(404)
        .json({ success: false, message: "Subadmin not found" });
    }

    // Update the password
    subadmin.password = newPassword;
    await subadmin.save();

    res.status(200).json({ success: true, message: "Password updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
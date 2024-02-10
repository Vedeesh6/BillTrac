const express = require("express")
const router = express.Router()
const Department = require("../models/department")
const Employee = require("../models/employee")
const Bill = require("../models/bill")
const nodemailer = require("nodemailer")

// Function to format date as "dd-mm-yyyy"
const formatDate = (date) => {
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    return formattedDate
}

const myemail = "nclnigahibts@gmail.com"
const password = "admb qrci lwst zuwp"

// Nodemailer transporter setup (replace with your email configuration)
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: myemail,
    pass: password,
  },
})

// Function to send email
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: myemail,
    to,
    subject,
    text,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log("Email sent successfully")
  } catch (error) {
    console.error("Error sending email:", error)
    throw error // Rethrow the error for the calling function to handle
  }
}

// Route to register a new bill
router.post("/register", async (req, res) => {
    const { billNumber, billType, personEIS, personName, personEmail, personPhoneNumber, registeringDepartment, currentDepartment } = req.body
  
    try {
      // Format the submissionDate as "dd-mm-yyyy"
      const formattedSubmissionDate = formatDate(new Date())
      
      // Create a new bill
      const newBill = new Bill({
        billNumber,
        billType,
        personEIS,
        personName,
        personEmail,
        personPhoneNumber,
        submissionDate: formattedSubmissionDate,
        lastEditedDate: formattedSubmissionDate,
        registeringDepartment,
        currentDepartment,
      })
  
      // Save the new bill to the database
      const savedBill = await newBill.save()
  
      // Update the counter of the registering department
      const department = await Department.findOne({ name: registeringDepartment })
      department.counter += 1
      await department.save()

      // Send email to the person who registered the bill
      const subject = "Bill Registration Successful"
      const text = `Dear ${personName},\n\nYour bill has been registered successfully.\n\nBill Number: ${billNumber}\n\nBill Type: ${billType}\n\nSubmission Date: ${formattedSubmissionDate}\n\nRegistering Department: ${registeringDepartment}\n\nThank you.`
      await sendEmail(personEmail, subject, text)
  
      res.status(201).json({ success: true, message: "Bill registered successfully", bill: savedBill })
    } catch (error) {
      console.error("Error during bill registration:", error)
      res.status(500).json({ success: false, message: "Internal server error" })
    }
})

// Fetch counter variable stored in department model
router.get("/max/:departmentName", async (req, res) => {
    const { departmentName } = req.params
    try {
      const departmentDetails = await Department.findOne({ name: departmentName })
        if (!departmentDetails) {
            return res.status(404).json({ success: false, message: "Department not found" })
        }
        res.json({ success: true, counter: departmentDetails.counter })
    } catch (error) {
        console.error("Error fetching department details:", error)
        res.status(500).json({ success: false, message: "Internal server error" })
    }
})

// Fetch bill details based on bill number
router.get("/:billNumber", async (req, res) => {
    const { billNumber } = req.params
    try {
      const billDetails = await Bill.findOne({ billNumber })
      if (!billDetails) {
        return res.status(404).json({ success: false, message: "Bill not found" })
      }
      res.json({ success: true, bill: billDetails })
    } catch (error) {
      console.error("Error fetching bill details:", error)
      res.status(500).json({ success: false, message: "Internal server error" })
    }
})

// Fetch all bills of a Employee
router.get("/emp/:personEIS", async (req, res) => {
  const { personEIS } = req.params
  try {
    //check if personEIS is number or not
    if(isNaN(personEIS)){
      return res.status(404).json({ success: false, message: "Please enter a number" })
    }
    const empcheck = await Employee.findOne({ EIS: personEIS })
    if (!empcheck) {
      return res.status(404).json({ success: false, message: "Employee not found" })
    }
    const billDetails = await Bill.find({ personEIS }).sort({ submissionDate: -1 })

    res.json({ success: true, bills: billDetails })
  } catch (error) {
    console.error("Error fetching bill details:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

// Forward bill to another department
router.put("/forward/:billNumber", async (req, res) => {
  const { billNumber } = req.params
  const { forwardToDepartment } = req.body

  try {
    // Fetch bill details
    const billDetails = await Bill.findOne({ billNumber })
    if (!billDetails) {
      return res.status(404).json({ success: false, message: "Bill not found" })
    }

    // Update the last edited date
    const formattedLastEditedDate = formatDate(new Date())

    // Update the current department
    billDetails.currentDepartment = forwardToDepartment
    billDetails.lastEditedDate = formattedLastEditedDate
    await billDetails.save()

    // Send email to the bill recipient
    const emailSubject = `Information on your Bill No. ${billNumber}`

    let emailText
    if(forwardToDepartment === "Closed"){
      emailText = `Dear ${billDetails.personName},\n\nYour bill has been processed for payment. Thank you.\n\nSent by Bill Tracking System`
    }else{
      emailText = `Dear ${billDetails.personName},\n\nYour bill of ${billDetails.billType} was forwarded to ${forwardToDepartment} for further action. Contact there for further information if needed.\n\nThank you.\n\nSent by Bill Tracking System`
    }

    await sendEmail(billDetails.personEmail, emailSubject, emailText)

    // Send message to bill recipient's phone number
    let messageText
    if(forwardToDepartment === "Closed"){
      messageText = `Your bill has been processed for payment. Thank you. - Bill Tracking System`
    }else{
      messageText = `Your bill of ${billDetails.billType} was forwarded to ${forwardToDepartment} for further action. Contact there for further details. Thank you. - Bill Tracking System`
    }

    //await sendSMS("+91"+billDetails.personPhoneNumber, messageText)

    const message=`${forwardToDepartment==="Closed"?"Bill Closed successfully":"Bill forwarded to "+forwardToDepartment+" successfully"}`

    res.json({ success: true, message: message , bill: billDetails })
  } catch (error) {
    console.error("Error forwarding bill:", error)
    res.status(500).json({ success: false, message: "Something went wrong" })
  }
})

module.exports = router
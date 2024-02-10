const express = require("express");
const app = express();

require("dotenv").config();

const database = require("./config/database");
const PORT = process.env.PORT || 4000;
database.connect();

const authRoutes = require("./routes/authRoutes");
const dept = require("./routes/departments");
const bill = require("./routes/bills");
const employee = require("./routes/employees");
const subadmin = require("./routes/subadmins");

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Port Check Successful");
});

app.use("/auth", authRoutes);
app.use("/departments", dept);
app.use("/bills", bill);
app.use("/employees", employee);
app.use("/subadmin", subadmin);

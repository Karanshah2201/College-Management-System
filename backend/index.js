const connectToMongo = require("./database/db");
const express = require("express");
const app = express();
const path = require("path");
const setupAutomation = require("./utils/automation");

connectToMongo();
setupAutomation();

const port = 4000 || process.env.PORT;
var cors = require("cors");

app.use(
  cors({
    origin: process.env.FRONTEND_API_LINK,
  })
);

app.use(express.json()); //to convert request data to json

app.get("/", (req, res) => {
  res.send("Hello 👋 I am Working Fine 🚀");
});

app.use("/media", express.static(path.join(__dirname, "media")));

app.use("/api/admin", require("./routes/details/admin-details.route"));
app.use("/api/faculty", require("./routes/details/faculty-details.route"));
app.use("/api/student", require("./routes/details/student-details.route"));

app.use("/api/branch", require("./routes/branch.route"));
app.use("/api/subject", require("./routes/subject.route"));
app.use("/api/notice", require("./routes/notice.route"));
app.use("/api/timetable", require("./routes/timetable.route"));
app.use("/api/material", require("./routes/material.route"));
app.use("/api/exam", require("./routes/exam.route"));
app.use("/api/marks", require("./routes/marks.route"));
app.use("/api/attendance", require("./routes/attendance.route"));
app.use("/api/leave", require("./routes/leave.route"));
app.use("/api/fees", require("./routes/fees.route"));
app.use("/api/payment", require("./routes/payment.route"));

app.listen(port, () => {
  console.log(`Server Listening On http://localhost:${port}`);
});

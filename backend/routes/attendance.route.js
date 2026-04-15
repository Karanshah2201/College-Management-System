const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const {
  markAttendanceController,
  getStudentsForAttendanceController,
  getAttendanceByDateController,
  getMyAttendanceController,
  getAttendanceReportController,
} = require("../controllers/attendance.controller");

// Faculty routes
router.post("/mark", auth, markAttendanceController);
router.get("/students", auth, getStudentsForAttendanceController);
router.get("/by-date", auth, getAttendanceByDateController);
router.get("/report", auth, getAttendanceReportController);

// Student route
router.get("/my", auth, getMyAttendanceController);

module.exports = router;

const Attendance = require("../models/attendance.model");
const StudentDetail = require("../models/details/student-details.model");
const Subject = require("../models/subject.model");
const ApiResponse = require("../utils/ApiResponse");

// Faculty: Mark attendance for a list of students for a given subject and date
const markAttendanceController = async (req, res) => {
  try {
    const { subjectId, date, semester, branchId, attendanceList } = req.body;
    // attendanceList: [{ studentId, status: "present" | "absent" }]
    const facultyId = req.userId;

    if (!subjectId || !date || !semester || !branchId || !attendanceList?.length) {
      return ApiResponse.badRequest("All fields are required").send(res);
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const operations = attendanceList.map(({ studentId, status }) => ({
      updateOne: {
        filter: {
          studentId,
          subjectId,
          date: attendanceDate,
        },
        update: {
          $set: {
            studentId,
            subjectId,
            facultyId,
            branchId,
            date: attendanceDate,
            status,
            semester,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    return ApiResponse.success(null, "Attendance marked successfully").send(res);
  } catch (error) {
    console.error("Mark Attendance Error:", error);
    return ApiResponse.internalServerError("Failed to mark attendance").send(res);
  }
};

// Faculty: Get students for a branch+semester to mark attendance
const getStudentsForAttendanceController = async (req, res) => {
  try {
    const { branchId, semester } = req.query;

    if (!branchId || !semester) {
      return ApiResponse.badRequest("Branch and semester are required").send(res);
    }

    const students = await StudentDetail.find({
      branchId,
      semester: Number(semester),
      status: "active",
    }).select("_id firstName middleName lastName enrollmentNo");

    return ApiResponse.success(students, "Students fetched successfully").send(res);
  } catch (error) {
    console.error("Get Students Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

// Faculty: Get existing attendance for a subject+date (to pre-fill form)
const getAttendanceByDateController = async (req, res) => {
  try {
    const { subjectId, date } = req.query;

    if (!subjectId || !date) {
      return ApiResponse.badRequest("Subject and date are required").send(res);
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const records = await Attendance.find({ subjectId, date: attendanceDate });

    return ApiResponse.success(records, "Attendance fetched").send(res);
  } catch (error) {
    console.error("Get Attendance Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

// Student: Get own attendance summary (per subject)
const getMyAttendanceController = async (req, res) => {
  try {
    const studentId = req.userId;

    const records = await Attendance.find({ studentId }).populate(
      "subjectId",
      "name"
    );

    // Group by subject and compute percentage
    const grouped = {};
    for (const record of records) {
      const subName = record.subjectId?.name || "Unknown";
      const subId = record.subjectId?._id?.toString();
      if (!grouped[subId]) {
        grouped[subId] = { subjectName: subName, present: 0, total: 0 };
      }
      grouped[subId].total++;
      if (record.status === "present") grouped[subId].present++;
    }

    const summary = Object.values(grouped).map((s) => ({
      ...s,
      percentage: s.total === 0 ? 0 : Math.round((s.present / s.total) * 100),
    }));

    return ApiResponse.success(summary, "Attendance summary fetched").send(res);
  } catch (error) {
    console.error("Get My Attendance Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

// Faculty: Get full attendance report for a subject
const getAttendanceReportController = async (req, res) => {
  try {
    const { subjectId } = req.query;

    if (!subjectId) {
      return ApiResponse.badRequest("Subject ID is required").send(res);
    }

    const records = await Attendance.find({ subjectId })
      .populate("studentId", "firstName middleName lastName enrollmentNo")
      .sort({ date: -1 });

    return ApiResponse.success(records, "Attendance report fetched").send(res);
  } catch (error) {
    console.error("Get Report Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  markAttendanceController,
  getStudentsForAttendanceController,
  getAttendanceByDateController,
  getMyAttendanceController,
  getAttendanceReportController,
};

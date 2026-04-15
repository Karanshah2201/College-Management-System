const Leave = require("../models/leave.model");
const FacultyDetail = require("../models/details/faculty-details.model");
const StudentDetail = require("../models/details/student-details.model");
const Subject = require("../models/subject.model");
const Attendance = require("../models/attendance.model");
const ApiResponse = require("../utils/ApiResponse");

// Helper: get all dates between two dates (inclusive)
const getDateRange = (from, to) => {
  const dates = [];
  const current = new Date(from);
  current.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// Student or Faculty: Submit a leave request
const requestLeaveController = async (req, res) => {
  try {
    const { facultyId, fromDate, toDate, reason, requesterType } = req.body;
    const userId = req.userId;

    if (!fromDate || !toDate || !reason || !requesterType) {
      return ApiResponse.badRequest("All fields are required").send(res);
    }

    const payload = {
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason,
      requesterType,
    };

    if (req.file) {
      payload.attachment = req.file.filename;
    }

    if (requesterType === "student") {
      payload.studentId = userId;
      if (!facultyId) {
        return ApiResponse.badRequest("Target faculty is required for student leaves").send(res);
      }
      payload.facultyId = facultyId;
    } else if (requesterType === "faculty") {
      payload.facultyId = userId;
    }

    const leave = await Leave.create(payload);

    return ApiResponse.created(leave, "Leave request submitted successfully").send(res);
  } catch (error) {
    console.error("Request Leave Error:", error.message);
    return ApiResponse.internalServerError(error.message || "Failed to submit leave").send(res);
  }
};

// Student or Faculty: Get own leave requests
const getMyLeavesController = async (req, res) => {
  try {
    const userId = req.userId;

    const leaves = await Leave.find({
      $or: [{ studentId: userId }, { facultyId: userId, requesterType: 'faculty' }]
    })
      .populate("facultyId", "firstName lastName")
      .populate("studentId", "firstName lastName")
      .sort({ createdAt: -1 });

    return ApiResponse.success(leaves, "Leave requests fetched").send(res);
  } catch (error) {
    console.error("Get My Leaves Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

// Faculty: Get all pending leave requests for their students
const getFacultyLeavesController = async (req, res) => {
  try {
    const facultyId = req.userId;

    const leaves = await Leave.find({ facultyId, requesterType: 'student' })
      .populate("studentId", "firstName middleName lastName enrollmentNo")
      .sort({ createdAt: -1 });

    return ApiResponse.success(leaves, "Leave requests fetched").send(res);
  } catch (error) {
    console.error("Get Faculty Leaves Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

// Admin: Get all leave requests
const getAdminLeavesController = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("studentId", "firstName middleName lastName enrollmentNo")
      .populate("facultyId", "firstName lastName employeeId")
      .sort({ createdAt: -1 });

    return ApiResponse.success(leaves, "All leave requests fetched").send(res);
  } catch (error) {
    console.error("Get Admin Leaves Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

// Admin/Faculty: Update leave status (approve/reject)
const updateLeaveStatusController = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, facultyRemark } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return ApiResponse.badRequest("Status must be 'approved' or 'rejected'").send(res);
    }

    // Not enforcing req.userId matching facultyId so Admin can approve as well
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return ApiResponse.notFound("Leave request not found").send(res);
    }

    leave.status = status;
    if (facultyRemark !== undefined) {
      leave.facultyRemark = facultyRemark;
    }
    await leave.save();

    // Auto-mark absent for all leave dates across all student's subjects
    if (status === "approved" && leave.requesterType === "student") {
      const student = await StudentDetail.findById(leave.studentId);

      if (student) {
        // Get all subjects for this student's branch + semester
        const subjects = await Subject.find({
          branch: student.branchId,
          semester: student.semester,
        });

        // Generate all dates in the leave period
        const dates = getDateRange(leave.fromDate, leave.toDate);

        // Build upsert operations: one per (subject × date)
        // Uses $setOnInsert so existing faculty-marked records are NOT overwritten
        const operations = [];
        for (const subject of subjects) {
          for (const date of dates) {
            operations.push({
              updateOne: {
                filter: {
                  studentId: leave.studentId,
                  subjectId: subject._id,
                  date,
                },
                update: {
                  $setOnInsert: {
                    studentId: leave.studentId,
                    subjectId: subject._id,
                    facultyId: subject.facultyId || leave.facultyId,
                    branchId: student.branchId,
                    date,
                    status: "absent",
                    semester: student.semester,
                  },
                },
                upsert: true,
              },
            });
          }
        }

        if (operations.length > 0) {
          await Attendance.bulkWrite(operations);
        }
      }
    }

    return ApiResponse.success(leave, `Leave ${status} successfully`).send(res);
  } catch (error) {
    console.error("Update Leave Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};


module.exports = {
  requestLeaveController,
  getMyLeavesController,
  getFacultyLeavesController,
  getAdminLeavesController,
  updateLeaveStatusController,
};

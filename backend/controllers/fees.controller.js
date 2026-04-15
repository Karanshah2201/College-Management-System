const Fee = require("../models/fees.model");
const StudentDetail = require("../models/details/student-details.model");
const ApiResponse = require("../utils/ApiResponse");

const calculatePenalty = (fee) => {
  const today = new Date();
  let lateFee = 0;
  
  // Convert to object regardless of if it's a Mongoose doc or POJO
  const feeObj = fee.toObject ? fee.toObject() : (fee._doc || fee);
  
  // Ensure dueDate is a valid Date object
  const dueDate = feeObj.dueDate ? new Date(feeObj.dueDate) : null;
  
  if (feeObj.status === "unpaid" && dueDate && today.getTime() > dueDate.getTime()) {
    const diffInTime = today.getTime() - dueDate.getTime();
    const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));
    if (diffInDays > 0) {
      lateFee = diffInDays * 50;
    }
  }
  
  return {
    ...feeObj,
    lateFee,
    totalAmount: (feeObj.amount || 0) + lateFee,
  };
};

const getFeesByStudentController = async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.userId }).sort({
      createdAt: -1,
    });
    const feesWithPenalty = fees.map((fee) => calculatePenalty(fee));
    return ApiResponse.success(feesWithPenalty, "Fees fetched successfully!").send(
      res
    );
  } catch (error) {
    console.error("Get Fees Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const createFeeController = async (req, res) => {
  try {
    const { studentId, title, amount, dueDate } = req.body;
    if (!studentId || !title || !amount || !dueDate) {
      return ApiResponse.badRequest("All fields are required").send(res);
    }
    const fee = await Fee.create({ studentId, title, amount, dueDate });
    return ApiResponse.created(fee, "Fee created successfully!").send(res);
  } catch (error) {
    console.error("Create Fee Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const updateFeeStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;
    const updateData = { status };
    if (status === "paid") {
      updateData.paidAt = new Date();
      updateData.transactionId = transactionId;
      
      const feeObj = await Fee.findById(id);
      if(feeObj) {
        const penaltyInfo = calculatePenalty(feeObj);
        updateData.lateFee = penaltyInfo.lateFee;
        updateData.totalAmount = penaltyInfo.totalAmount;
      }
    }
    const fee = await Fee.findByIdAndUpdate(id, updateData, { new: true });
    if (!fee) {
      return ApiResponse.notFound("Fee not found").send(res);
    }
    return ApiResponse.success(fee, "Fee updated successfully!").send(res);
  } catch (error) {
    console.error("Update Fee Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const getAllFeesController = async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate("studentId", "firstName lastName studentId branchId email")
      .sort({ createdAt: -1 });

    const feesWithPenalty = fees.map((fee) => {
      try {
        return calculatePenalty(fee);
      } catch (err) {
        console.error("Penalty Calc Error for Doc:", fee._id, err);
        return fee.toObject ? fee.toObject() : fee;
      }
    });

    return ApiResponse.success(
      feesWithPenalty,
      "All fees fetched successfully!"
    ).send(res);
  } catch (error) {
    console.error("Get All Fees Error: ", error);
    return ApiResponse.internalServerError("Error retrieving fee records").send(res);
  }
};

const deleteFeeController = async (req, res) => {
  try {
    const { id } = req.params;
    await Fee.findByIdAndDelete(id);
    return ApiResponse.success(null, "Fee deleted successfully").send(res);
  } catch (error) {
    console.error("Delete Fee Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const bulkAssignFeesController = async (req, res) => {
  try {
    const { startDate, amount, titlePrefix } = req.body;
    if (!startDate || !amount) {
      return ApiResponse.badRequest("Start Date and Amount are required").send(res);
    }

    const students = await StudentDetail.find({ status: "active" });
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + 2); // 2 months from start date

    const results = await Promise.all(
      students.map(async (student) => {
        try {
          // 1. Assign Fee
          await Fee.create({
            studentId: student._id,
            title: `${titlePrefix || "Semester Fee"} - Sem ${
              student.semester || 1
            }`,
            amount: Number(amount),
            dueDate: dueDate,
          });

          // 2. Update Student Semester Start Date
          await StudentDetail.findByIdAndUpdate(student._id, {
            semesterStartedAt: new Date(startDate),
          });
          
          return { studentId: student._id, status: "success" };
        } catch (err) {
          console.error(`Bulk Assign Fail for Student ${student._id}: `, err);
          return { studentId: student._id, status: "fail", error: err.message };
        }
      })
    );

    const successful = results.filter((r) => r.status === "success").length;
    return ApiResponse.success(
      null,
      `Session launched. Assigned fees to ${successful}/${students.length} students`
    ).send(res);
  } catch (error) {
    console.error("Bulk Assign Error: ", error);
    return ApiResponse.internalServerError("Failed to launch session").send(res);
  }
};

module.exports = {
  getFeesByStudentController,
  createFeeController,
  updateFeeStatusController,
  getAllFeesController,
  deleteFeeController,
  bulkAssignFeesController,
};

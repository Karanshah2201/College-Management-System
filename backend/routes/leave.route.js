const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware");
const {
  requestLeaveController,
  getMyLeavesController,
  getFacultyLeavesController,
  getAdminLeavesController,
  updateLeaveStatusController,
} = require("../controllers/leave.controller");

// Student/Faculty routes for requesting their own leave
router.post("/request", auth, upload.single("attachment"), requestLeaveController);
router.get("/my", auth, getMyLeavesController);

// Faculty routes for seeing student leaves
router.get("/faculty", auth, getFacultyLeavesController);

// Admin routes for seeing ALL leaves
router.get("/admin", auth, getAdminLeavesController);

// Both Faculty and Admin can update leave statuses
router.patch("/status/:leaveId", auth, updateLeaveStatusController);

module.exports = router;

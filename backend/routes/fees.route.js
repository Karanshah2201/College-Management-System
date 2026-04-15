const express = require("express");
const router = express.Router();
const {
  getFeesByStudentController,
  createFeeController,
  updateFeeStatusController,
  getAllFeesController,
  deleteFeeController,
  bulkAssignFeesController,
} = require("../controllers/fees.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/all", auth, getAllFeesController);
router.get("/my-fees", auth, getFeesByStudentController);
router.post("/create", auth, createFeeController);
router.post("/bulk-assign", auth, bulkAssignFeesController);
router.patch("/update/:id", auth, updateFeeStatusController);
router.delete("/delete/:id", auth, deleteFeeController);

module.exports = router;

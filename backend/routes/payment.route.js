const express = require("express");
const router = express.Router();
const {
  capturePayment,
  verifyPayment,
} = require("../controllers/payment.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/capture", auth, capturePayment);
router.post("/verify", auth, verifyPayment);

module.exports = router;

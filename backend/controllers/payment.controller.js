const Razorpay = require("razorpay");
const crypto = require("crypto");
const Fee = require("../models/fees.model");
const ApiResponse = require("../utils/ApiResponse");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

const calculateTotalAmount = (fee) => {
  const today = new Date();
  let lateFee = 0;
  const dueDate = fee.dueDate ? new Date(fee.dueDate) : null;
  
  if (fee.status === "unpaid" && dueDate && today.getTime() > dueDate.getTime()) {
    const diffInTime = today.getTime() - dueDate.getTime();
    const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));
    if (diffInDays > 0) {
      lateFee = diffInDays * 50;
    }
  }
  return Math.round((fee.amount + lateFee) * 100); // Razorpay expects amount in paise
};

const capturePayment = async (req, res) => {
  try {
    const { feeId } = req.body;
    const fee = await Fee.findById(feeId);
    if (!fee) return ApiResponse.notFound("Fee record not found").send(res);
    if (fee.status === "paid") {
      return ApiResponse.badRequest("Fee has already been paid").send(res);
    }

    const amount = calculateTotalAmount(fee);

    const receipt = `rcpt_${feeId.toString()}`.slice(0, 40);
    console.log("Initiating Razorpay Order with Receipt:", receipt);

    const options = {
      amount: amount,
      currency: "INR",
      receipt: receipt,
    };

    const order = await razorpay.orders.create(options);
    return ApiResponse.success(order, "Order created successfully").send(res);
  } catch (error) {
    console.error("Capture Payment Error: ", error);
    return ApiResponse.internalServerError("Could not initiate payment").send(res);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      feeId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const fee = await Fee.findById(feeId);
      if(!fee) return ApiResponse.notFound("Fee record not found during verification").send(res);
      
      const totalInPaise = calculateTotalAmount(fee);
      const paidTotal = totalInPaise / 100;
      const lateFee = paidTotal - fee.amount;

      await Fee.findByIdAndUpdate(feeId, {
        status: "paid",
        transactionId: razorpay_payment_id,
        paidAt: new Date(),
        totalAmount: paidTotal,
        lateFee: lateFee
      });
      return ApiResponse.success(null, "Payment verified successfully").send(res);
    } else {
      return ApiResponse.badRequest("Invalid payment signature").send(res);
    }
  } catch (error) {
    console.error("Verify Payment Error: ", error);
    return ApiResponse.internalServerError("Verification failed").send(res);
  }
};

module.exports = { capturePayment, verifyPayment };

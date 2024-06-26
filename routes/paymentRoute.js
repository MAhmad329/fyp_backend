const express = require("express");
const router = express.Router();
const {
    createPaymentIntent,
    capturePayment,
    refundPayment,
    createPayout,
    transferFunds
} = require("../controllers/paymentController");

router.post("/create-payment-intent", createPaymentIntent);
router.post("/capture-payment", capturePayment);
router.post("/refund-payment", refundPayment);
router.post("/create-payout", createPayout);
router.post("/transfer-funds", transferFunds);

module.exports = router;

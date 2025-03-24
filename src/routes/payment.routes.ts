import express from "express";
import { halfRefundPaymentController, makePaymentController, refundPaymentController, riderCommissionController } from "../controllers/payment.controller";

const router = express.Router();

// POST route for making a payment using Stripe
router.post("/order", makePaymentController);
router.post("/refund/:order_id", refundPaymentController);
router.post("/halfRefund", halfRefundPaymentController);
router.post("/riderCommission", riderCommissionController);
  
export default router;

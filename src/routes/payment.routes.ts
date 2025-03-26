import express from "express";
import {  makePaymentController,  refundController,  riderCommissionController } from "../controllers/payment.controller";

const router = express.Router();

// POST route for making a payment using Stripe
router.post("/order", makePaymentController);
router.post("/riderCommission", riderCommissionController);
router.post("/refund", refundController);
  
export default router;
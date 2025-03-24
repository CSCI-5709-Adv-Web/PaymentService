import { NextFunction, Request, Response } from "express";
import { halfRefundPaymentService, makePaymentService, refundPaymentService, riderCommissionService } from "../service/payment.service";
import { logger } from "../utils";
import mongoose from "mongoose";

/**
 * Controller to handle payment processing
 */
export const makePaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request
    const { cardDetails, orderId, amount } = req.body;

    // Process payment through service layer
    const payment = await makePaymentService(cardDetails, orderId, amount);

    res.status(201).json({
      success: true,
      data: {
        paymentId: payment.stripePaymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refundPaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get order_id from route parameters
    const { order_id } = req.params;

    // Process refund through service layer
    const refund = await refundPaymentService(order_id);

    res.status(200).json({
      success: true,
      data: {
        refundId: refund.id,
        orderId: refund.orderId,
        amount: refund.amount,
        status: refund.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle half payment refunds
 */
export const halfRefundPaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request
    const { order_id, rider_id } = req.body;

    // Process half refund through service layer
    const refund = await halfRefundPaymentService(order_id, rider_id);

    res.status(200).json({
      success: true,
      data: {
        refundId: refund.id,
        orderId: refund.orderId,
        amount: refund.amount,
        status: refund.status,
        rider_id: refund.rider_id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle rider commissions (20% of payment)
 */
export const riderCommissionController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request
    const { order_id, rider_id } = req.body;

    // Process rider commission through service layer
    const commission = await riderCommissionService(order_id, rider_id);

    res.status(200).json({
      success: true,
      message: "rider commission",
      data: {
        orderId: commission.orderId,
        riderId: commission.riderId,
        totalAmount: commission.totalAmount,
        commissionAmount: commission.commissionAmount,
        percentage: commission.percentage
      }
    });
  } catch (error) {
    next(error);
  }
};
 // try {
  //   const { amount, orderId } = req.body;

  //   if (!amount || !orderId) {
  //     logger.warn("Missing payment details", { amount, orderId });
  //     res.status(400).json({ success: false, message: "Both amount and orderId are required" });
  //     return;
  //   }

  //   if (!mongoose.Types.ObjectId.isValid(orderId)) {
  //     logger.warn(`Invalid orderId: ${orderId}`);
  //     res.status(400).json({ success: false, message: "Invalid orderId format" });
  //     return;
  //   }

  //   const numericAmount = Number(amount);
  //   if (isNaN(numericAmount) || numericAmount <= 0) {
  //     logger.warn(`Invalid amount: ${amount}`);
  //     res.status(400).json({ success: false, message: "Amount must be a positive number" });
  //     return;
  //   }

  //   logger.info(`Processing payment for order ${orderId}`);
  //   const paymentResponse = await makePaymentService(numericAmount, orderId);

  //   res.status(200).json(paymentResponse);
  // } catch (error: any) {
  //   logger.error(`Payment error: ${error.message}`);
  //   const msg = error.message.includes("already paid")
  //     ? [400, error.message]
  //     : error.message.includes("not found")
  //     ? [404, error.message]
  //     : [500, "Failed to create payment intent"];

  //   res.status(msg[0]).json({ success: false, message: msg[1] });
  // }
 
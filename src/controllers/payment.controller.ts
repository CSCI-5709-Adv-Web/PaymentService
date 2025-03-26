import { NextFunction, Request, Response } from "express";
import { halfRefundPaymentService, makePaymentService, refundPaymentService, riderCommissionService } from "../service/payment.service";
import { logger } from "../utils";
import mongoose from "mongoose";
import { createApiResponse } from "../utils/response";

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
    const result = await makePaymentService(cardDetails, orderId, amount);
    
    createApiResponse(res, `Payment of ${result.payment.orderId} successfully done!`, 201, {
      paymentId: result.payment.stripePaymentId,
      orderId: result.payment.orderId,
      amount: result.payment.amount,
      status: result.payment.status,
      paymentAT: result.formattedTimestamp
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

    createApiResponse(res, `Refund of ${refund.orderId} successfully done!`, 201, {
      refundId: refund.id,
      orderId: refund.orderId,
      amount: refund.amount,
      status: refund.status,
      refundAT: refund.time
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

    createApiResponse(res, `Refund of ${refund.orderId} successfully done!`, 201, {
      refundId: refund.id,
      orderId: refund.orderId,
      amount: refund.amount,
      status: refund.status,
      halfrefundAT: refund.time
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

    createApiResponse(res, `Rider commission for ${commission.orderId} successfully processed!`, 201, {
      orderId: commission.orderId,
      riderId: commission.riderId,
      totalAmount: commission.totalAmount,
      commissionAmount: commission.commissionAmount,
      SalaryAT: commission.formattedTimestamp
    });
  } catch (error) {
    next(error);
  }
};


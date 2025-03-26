import { NextFunction, Request, Response } from "express";
import {  makePaymentService,  refundService,  riderCommissionService } from "../service/payment.service";
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


// In payment.controller.ts
export const refundController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get order_id from request body
    const { order_id } = req.body;

    if (!order_id) {
      res.status(400).json({
        success: false,
        message: "order_id is required"
      });
      return;
    }

    // Process refund through refund service
    const result = await refundService(order_id);

    // Determine message based on refund type
    const message = result.isFullRefund 
      ? `Full refund of ${result.amount} processed for order ${order_id}`
      : `Partial refund of ${result.amount} processed for order ${order_id}`;

    createApiResponse(res, message, 200, {
      refundId: result.refundId,
      orderId: order_id,
      amount: result.amount,
      status: result.status,
      refundType: result.isFullRefund ? 'FULL' : 'PARTIAL',
      refundTime: result.formattedTimestamp
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


import { logger } from "../utils";
import mongoose from "mongoose";
import {Payment} from "../db/Models/payment.model"

const create = async (paymentData) => {
  const payment = new Payment(paymentData);
  return await payment.save();
};

const findByOrderId = async (orderId) => {
  return await Payment.findOne({ orderId });
};

const findOneByIdAndUpdateStatusAndAddRefund = async (orderId, status, refundAmount, stripeRefundId, refundTimeStamp) => {
  return await Payment.findOneAndUpdate(
    { orderId: orderId },  // Use orderId field, not _id
    { 
      $set: {
        status: status,
        refundAmount: refundAmount,
        stripeRefundId: stripeRefundId,
        refundTimeStamp: refundTimeStamp
      } 
    },
    { new: true }
  );
};
const paymentRepository = {
  create: async (paymentData) => {
    const payment = new Payment(paymentData);
    return await payment.save();
  },
  
  findByOrderId: async (orderId) => {
    return await Payment.findOne({ orderId });
  },
  
  findByStripeId: async (stripePaymentId) => {
    return await Payment.findOne({ stripePaymentId });
  },
  
  update: async (orderId, data) => {
    return await Payment.findOneAndUpdate(
      { orderId },
      { $set: data },
      { new: true }
    );
  }
};

export = {
  create,
  findByOrderId,
  paymentRepository,
  findOneByIdAndUpdateStatusAndAddRefund
}

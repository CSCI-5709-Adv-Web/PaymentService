// src/db/Models/refund.model.ts
import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  stripeRefundId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['FULL', 'PARTIAL'],
    required: true
  },
  time: {
    type: String,
    required: true
  },
  refundReason: {
    type: String,
    default: ''
  }
});

export const Refund = mongoose.model('refund', refundSchema);
// src/Models/payment.model.ts
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  stripePaymentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PAID', 'REFUND', 'PARTIAL-REFUND'],
    default: 'PAID'
  },
  time: {
    type: Date,
    require: true
  }
});

export const Payment = mongoose.model('PaymentFeatures', paymentSchema); 


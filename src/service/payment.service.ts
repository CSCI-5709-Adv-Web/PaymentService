import { logger } from "../utils";
import dotenv from "dotenv";
import { stripe } from "../config/stripe.config";
import paymentRepository from "../repository/payment.repository";
dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const makePaymentService = async (cardDetails: any, orderId: string, amount: number) => {
  try {
    // Check if payment for this order already exists
    const existingPayment = await paymentRepository.findByOrderId(orderId);
    if (existingPayment) {
      const error = new Error('Payment for this order already exists');
      throw error;
    }

    // Create a charge using a test token directly
    const charge = await stripe.charges.create({
      amount: Math.round(amount * 100),
      currency: 'cad',
      source: 'tok_visa', // This is Stripe's test token for a Visa card
      description: `Payment for order ${orderId}`
    });

    // Extract timestamp from Stripe
    const stripeTimestamp = new Date(charge.created * 1000);
    const formattedTimestamp = `${stripeTimestamp.toLocaleDateString()} ${stripeTimestamp.toLocaleTimeString()}`;

    // Determine payment status based on Stripe response
    let status = 'pending';
    if (charge.status === 'succeeded') {
      status = 'completed';
    } else if (charge.status === 'pending') {
      status = 'pending';
    } else {
      status = 'failed';
    }


    // Save payment record to database
    const payment = await paymentRepository.create({
      orderId,
      amount,
      stripePaymentId: charge.id,
      status: charge.status === 'succeeded' ? 'PAID' : charge.status,
      time: formattedTimestamp
    });
    
    return {
      payment,
      formattedTimestamp
    };
  } catch (error) {
    // Handle Stripe-specific errors
    if (error.type && error.type.startsWith('Stripe')) {
      const customError = new Error(error.message || 'Payment processing failed');
      throw customError;
    }

    // Rethrow other errors
    throw error;
  }
};

export const refundPaymentService = async (orderId: string) => {
  try {
    // Find the payment in the database by order ID
    const payment = await paymentRepository.findByOrderId(orderId);

    if (!payment) {
      const error = new Error(`Payment for order ${orderId} not found`);
      throw error;
    }

    // Check if payment has already been refunded
    if (payment.status === 'REFUND') {
      const error = new Error(`Payment for order ${orderId} has already been refunded`);
      throw error;
    }

    // Create a refund in Stripe
    const refund = await stripe.refunds.create({
      charge: payment.stripePaymentId,
    });

    // Extract timestamp from Stripe
    const stripeTimestamp = new Date(refund.created * 1000);
    const formattedTimestamp = `${stripeTimestamp.toLocaleDateString()} ${stripeTimestamp.toLocaleTimeString()}`;

    // Update payment status to refunded
    const updatedPaymentDetails = paymentRepository.findOneByIdAndUpdateStatusAndAddRefund(orderId,"REFUND",payment.amount,refund.id,formattedTimestamp);

    return updatedPaymentDetails;
  } catch (error) {
    // Handle Stripe-specific errors
    if (error.type && error.type.startsWith('Stripe')) {
      const customError = new Error(error.message || 'Refund processing failed');
      throw customError;
    }

    // Rethrow other errors
    throw error;
  }
};

export const halfRefundPaymentService = async (orderId: string, riderId: string) => {
  try {
    // Find the payment in the database by order ID
    const payment = await paymentRepository.findByOrderId(orderId);

    if (!payment) {
      const error = new Error(`Payment for order ${orderId} not found`);
      throw error;
    }

    // Check if payment has already been fully refunded
    if (payment.status === 'REFUND') {
      const error = new Error(`Payment for order ${orderId} has already been fully refunded`);
      throw error;
    }

    // Calculate half amount (round to nearest cent)
    const halfAmount = Math.round(payment.amount * 50) / 100;

    // Create a partial refund in Stripe
    const refund = await stripe.refunds.create({
      charge: payment.stripePaymentId,
      amount: Math.round(halfAmount * 100), // Convert to cents for Stripe
    });

    // Extract timestamp from Stripe
    const stripeTimestamp = new Date(refund.created * 1000);
    const formattedTimestamp = `${stripeTimestamp.toLocaleDateString()} ${stripeTimestamp.toLocaleTimeString()}`;

    // Update payment status to partially_refunded
    // payment.status = 'PARTIAL-REFUND';
    // await payment.save();
    const updatedPaymentDetails = await paymentRepository.findOneByIdAndUpdateStatusAndAddRefund(orderId, "PARTIAL-REFUND", halfAmount, refund.id,formattedTimestamp);

    return updatedPaymentDetails;
  } catch (error) {
    // Handle Stripe-specific errors
    if (error.type && error.type.startsWith('Stripe')) {
      const customError = new Error(error.message || 'Half refund processing failed');
      throw customError;
    }

    // Rethrow other errors
    throw error;
  }
};

export const riderCommissionService = async (orderId: string, riderId: string) => {
  try {
    // Find the payment in the database by order ID
    const payment = await paymentRepository.findByOrderId(orderId);

    if (!payment) {
      const error = new Error(`Payment for order ${orderId} not found`);
      throw error;
    }

    // Check if payment is completed
    if (payment.status !== 'PARTIAL-REFUND') {
      const error = new Error(`Payment for order ${orderId} is not completed. Current status: ${payment.status}`);
      throw error;
    }

    // Calculate rider commission (20% of total amount)
    const commissionPercentage = 20;
    const commissionAmount = (payment.amount * commissionPercentage) / 100;

    // Round to 2 decimal places
    const roundedCommissionAmount = Math.round(commissionAmount * 100) / 100;

    // Get current timestamp
    const now = new Date();
    const formattedTimestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

    // Return commission details
    return {
      orderId: payment.orderId,
      riderId: riderId,
      totalAmount: payment.amount,
      commissionAmount: roundedCommissionAmount,
      percentage: commissionPercentage,
      formattedTimestamp: payment.time || formattedTimestamp
    };
  } catch (error) {
    // Handle any errors
    throw error;
  }
};
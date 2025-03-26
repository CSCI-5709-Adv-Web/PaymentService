import { logger } from "../utils";
import dotenv from "dotenv";
import { stripe } from "../config/stripe.config";
import paymentRepository from "../repository/payment.repository";
import refundRepository from "../repository/refund.repository";
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


export const refundService = async (orderId) => {
  try {
    // Find the payment in the database by order ID
    const payment = await paymentRepository.findByOrderId(orderId);

    if (!payment) {
      const error = new Error(`Payment for order ${orderId} not found`);
      throw error;
    }

    // Check if a refund already exists for this order
    const existingRefund = await refundRepository.findByOrderId(orderId);
    if (existingRefund) {
      const error = new Error(`Refund for order ${orderId} already exists`);
      throw error;
    }

    // Check if payment status allows refunds
    if (payment.status !== 'PAID') {
      const error = new Error(`Payment for order ${orderId} cannot be refunded. Current status: ${payment.status}`);
      throw error;
    }

    // Get payment timestamp and current time
    const paymentTime = payment.time ? new Date(payment.time) : new Date();
    const currentTime = new Date();
    
    // Calculate difference in minutes
    const timeDiffMinutes = (currentTime.getTime() - paymentTime.getTime()) / (1000 * 60);
    
    // Determine refund type based on time difference
    const isFullRefund = timeDiffMinutes <= 1;
    
    // Process refund in Stripe
    let refundAmount = payment.amount;
    if (!isFullRefund) {
      // Calculate half amount for partial refund
      refundAmount = Math.round(payment.amount * 50) / 100;
    }
    
    const refund = await stripe.refunds.create({
      charge: payment.stripePaymentId,
      amount: isFullRefund ? undefined : Math.round(refundAmount * 100), // Full refund doesn't need amount
    });

    // Extract timestamp from Stripe
    const stripeTimestamp = new Date(refund.created * 1000);
    const formattedTimestamp = `${stripeTimestamp.toLocaleDateString()} ${stripeTimestamp.toLocaleTimeString()}`;

    // Update payment status
    const paymentStatus = isFullRefund ? 'REFUND' : 'PARTIAL-REFUND';
    const updatedPayment = await paymentRepository.findOneByIdAndUpdateStatusAndAddRefund(
      orderId, 
      paymentStatus,
      refundAmount,
      refund.id,
      formattedTimestamp
    );

    // Create a new refund record in the refund collection
    const refundRecord = await refundRepository.create({
      orderId: orderId,
      paymentId: payment.stripePaymentId,
      amount: refundAmount,
      stripeRefundId: refund.id,
      status: isFullRefund ? 'FULL' : 'PARTIAL',
      time: formattedTimestamp,
      refundReason: isFullRefund ? 'Refund requested within 1 minute' : 'Refund requested after 1 minute'
    });

    return {
      payment: updatedPayment,
      refund: refundRecord,
      refundId: refund.id,
      amount: refundAmount,
      status: paymentStatus,
      isFullRefund: isFullRefund,
      formattedTimestamp
    };
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


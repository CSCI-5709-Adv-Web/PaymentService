import { logger } from "../utils";
import dotenv from "dotenv";
import {stripe} from "../config/stripe.config";
import paymentRepository from "../repository/payment.repository";
dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}


export const makePaymentService = async (cardDetails : any, orderId: string,amount: number) => {
  
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
      currency: 'cad',
      stripePaymentId: charge.id,
      status,
    });

    return payment;
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
    if (payment.status === 'refunded') {
      const error = new Error(`Payment for order ${orderId} has already been refunded`);
      throw error;
    }

    // Create a refund in Stripe
    const refund = await stripe.refunds.create({
      charge: payment.stripePaymentId,
    });

    // Update payment status to refunded
    payment.status = 'refunded';
    await payment.save();

    return {
      id: refund.id,
      orderId: payment.orderId,
      amount: payment.amount,
      status: 'refunded'
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

export const halfRefundPaymentService = async (orderId: string, riderId: string) => {
  try {
    // Find the payment in the database by order ID
    const payment = await paymentRepository.findByOrderId(orderId);
    
    if (!payment) {
      const error = new Error(`Payment for order ${orderId} not found`);
      throw error;
    }

    // Check if payment has already been fully refunded
    if (payment.status === 'refunded') {
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

    // Update payment status to partially_refunded
    // Note: You'll need to add 'partially_refunded' to your enum in the model
    payment.status = 'partially_refunded';
    await payment.save();

    return {
      id: refund.id,
      orderId: payment.orderId,
      amount: halfAmount,
      status: 'partially_refunded',
      rider_id: riderId
    };
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
    if (payment.status !== 'completed') {
      const error = new Error(`Payment for order ${orderId} is not completed. Current status: ${payment.status}`);
      throw error;
    }
    
    // Calculate rider commission (20% of total amount)
    const commissionPercentage = 20;
    const commissionAmount = (payment.amount * commissionPercentage) / 100;
    
    // Round to 2 decimal places
    const roundedCommissionAmount = Math.round(commissionAmount * 100) / 100;
    
    // Return commission details
    return {
      orderId: payment.orderId,
      riderId: riderId,
      totalAmount: payment.amount,
      commissionAmount: roundedCommissionAmount,
      percentage: commissionPercentage
    };
  } catch (error) {
    // Handle any errors
    throw error;
  }
};

// export const processPayment = async (orderId: string, amount: number) => {
//   try {
//     // Create a simple Stripe payment
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(amount * 100),
//       currency: "cad",
//       metadata: { order_id: orderId },
//       payment_method_types: ['card'],
//     });
    
//     console.log("Process Payment Response:", JSON.stringify(paymentIntent, null, 2));
    
//     // Immediately confirm the payment intent for testing
//     try {
//       const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
//         payment_method: "pm_card_visa"
//       });
      
//       console.log("Payment Confirmation Response:", JSON.stringify(confirmedIntent, null, 2));
      
//       const success = confirmedIntent.status === "succeeded";
      
//       return {
//         paymentIntentId: confirmedIntent.id,
//         clientSecret: confirmedIntent.client_secret,
//         status: confirmedIntent.status,
//         success: success,
//         message: success 
//           ? `Payment of $${amount/100} successfully processed for order ${orderId}` 
//           : `Payment not yet completed for order ${orderId}`
//       };
//     } catch (confirmError) {
//       console.error("Payment confirmation error:", confirmError);
//       throw confirmError;
//     }
//   } catch (error) {
//     console.error("Process payment error:", error);
//     throw error;
//   }
// };




// try {
  //   logger.info(`Processing payment for order ${orderId} with amount ${amount}`);

  //   // Convert amount to cents for Stripe
  //   const amountInCents = Math.round(amount * 100);

  //   // Create payment intent with explicit payment method types for API usage
  //   const paymentIntent = await stripe.paymentIntents.create({
  //     amount: amountInCents,
  //     currency: "cad",
  //     metadata: { order_id: orderId },
  //     payment_method_types: ['card'], // Restrict to card payments only
  //   });

  //   // Log the full Stripe response
  //   console.log("Stripe Payment Intent Response:", JSON.stringify(paymentIntent, null, 2));

  //   let paymentSuccess = false;
  //   let confirmedIntent = null;

  //   // For API testing in development mode, confirm with a test payment method
  //   if (process.env.NODE_ENV === "development") {
  //     try {
  //       confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
  //         payment_method: "pm_card_visa"
  //       });

  //       console.log("Stripe Confirmation Response:", JSON.stringify(confirmedIntent, null, 2));
        
  //       // Check if payment was successful
  //       if (confirmedIntent.status === "succeeded") {
  //         paymentSuccess = true;
  //         console.log(`✅ Payment successful for order ${orderId}`);
  //       } else {
  //         console.log(`⚠️ Payment not yet successful. Status: ${confirmedIntent.status}`);
  //       }
  //     } catch (confirmError: any) {
  //       console.error("Stripe confirmation error:", confirmError);
  //     }
  //   }

  //   // Return success information along with payment details
  //   return {
  //     paymentIntentId: paymentIntent.id,
  //     clientSecret: paymentIntent.client_secret,
  //     status: confirmedIntent ? confirmedIntent.status : paymentIntent.status,
  //     success: paymentSuccess,
  //     paymentDate: paymentSuccess ? new Date().toISOString() : null,
  //     message: paymentSuccess 
  //       ? `Payment of $${amount} successfully processed for order ${orderId}` 
  //       : `Payment intent created but not yet completed for order ${orderId}`
  //   };
  // } catch (error: any) {
  //   console.error("Payment processing error:", error);
  //   throw new Error(`Failed to process payment: ${error.message}`);
  // }
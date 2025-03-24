import dotenv from "dotenv";
dotenv.config();

export const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15', // Use a specific API version
    typescript: false,
    // This option explicitly enables processing raw card details - only use in secure environments
    // and meet PCI compliance requirements
    stripeAccount: process.env.STRIPE_ACCOUNT_ID // Optional: for Connect platforms
  });
  
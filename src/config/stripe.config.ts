import dotenv from "dotenv";
dotenv.config();

export const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
    typescript: false,
    stripeAccount: process.env.STRIPE_ACCOUNT_ID
  });
  
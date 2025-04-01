import dotenv from "dotenv";
import Stripe from "stripe";
dotenv.config();

// Create a custom logger
const stripeLogger = {
  debug: (message: string) => console.debug('[STRIPE DEBUG]', message),
  info: (message: string) => console.log('[STRIPE INFO]', message),
  warn: (message: string) => console.warn('[STRIPE WARN]', message),
  error: (message: string) => console.error('[STRIPE ERROR]', message)
};

// Initialize Stripe with proper typing
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia', // Updated to latest stable version
  typescript: true,
  stripeAccount: process.env.STRIPE_ACCOUNT_ID,
  timeout: 30000,
  maxNetworkRetries: 3,
  httpClient: Stripe.createFetchHttpClient()
});

// Attach logger separately (not through config)
(stripe as any)._api.logger = stripeLogger;
import { logger } from "./logger"
import dotenv from "dotenv"
import type {
  StripeCustomer,
  StripePaymentMethod,
  StripePaymentIntent,
  StripeRefund,
  StripeListResponse,
} from "../types/stripe-api.types"

dotenv.config()

// Extend RequestInit to include timeout
declare module "node:http" {
  interface RequestInit {
    timeout?: number
  }
}

// Stripe API base URL
const STRIPE_API_BASE = "https://api.stripe.com/v1"

// Get Stripe secret key from environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_ACCOUNT_ID = process.env.STRIPE_ACCOUNT_ID

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required")
}

// Headers for Stripe API requests
const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
  }

  if (STRIPE_ACCOUNT_ID) {
    headers["Stripe-Account"] = STRIPE_ACCOUNT_ID
  }

  return headers
}

// Convert object to URL encoded form data
const objectToFormData = (obj: Record<string, any>, parentKey = ""): string => {
  const result: string[] = []

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]
      const encodedKey = parentKey ? `${parentKey}[${key}]` : key

      if (value === null || value === undefined) {
        continue
      } else if (typeof value === "object" && !Array.isArray(value)) {
        result.push(objectToFormData(value, encodedKey))
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === "object") {
            result.push(objectToFormData(item, `${encodedKey}[${index}]`))
          } else {
            result.push(`${encodedKey}[${index}]=${encodeURIComponent(item)}`)
          }
        })
      } else {
        result.push(`${encodedKey}=${encodeURIComponent(value)}`)
      }
    }
  }

  return result.join("&")
}

// Generic function to make Stripe API requests
export const stripeRequest = async <T>(
  method: string,
  endpoint: string,
  data?: Record<string, any>
)
: Promise<T> =>
{
  const url = `${STRIPE_API_BASE}${endpoint}`

  try {
    const options: RequestInit = {
      method,
      headers: getHeaders(),
    }

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = objectToFormData(data)
    }

    // For GET requests with parameters, append them to the URL
    const fullUrl = method === "GET" && data ? `${url}?${objectToFormData(data)}` : url

    logger.info(`Making Stripe API request: ${method} ${endpoint}`)

    const response = await fetch(fullUrl, options)
    const responseData = await response.json()

    if (!response.ok) {
      logger.error(`Stripe API error: ${response.status} ${JSON.stringify(responseData)}`)
      throw new Error(responseData.error?.message || "Stripe API request failed")
    }

    return responseData as T;
  } catch (error) {
    logger.error(`Error making Stripe API request to ${endpoint}:`, error)
    throw error
  }
}

// Stripe API endpoints
export const stripeApi = {
  customers: {
    create: (data: Record<string, any>) => stripeRequest<StripeCustomer>("POST", "/customers", data),
    retrieve: (id: string) => stripeRequest<StripeCustomer>("GET", `/customers/${id}`),
    update: (id: string, data: Record<string, any>) => stripeRequest<StripeCustomer>("POST", `/customers/${id}`, data),
    list: (params?: Record<string, any>) =>
      stripeRequest<StripeListResponse<StripeCustomer>>("GET", "/customers", params),
  },
  paymentMethods: {
    create: (data: Record<string, any>) => stripeRequest<StripePaymentMethod>("POST", "/payment_methods", data),
    retrieve: (id: string) => stripeRequest<StripePaymentMethod>("GET", `/payment_methods/${id}`),
    update: (id: string, data: Record<string, any>) =>
      stripeRequest<StripePaymentMethod>("POST", `/payment_methods/${id}`, data),
    list: (params: Record<string, any>) =>
      stripeRequest<StripeListResponse<StripePaymentMethod>>("GET", "/payment_methods", params),
    attach: (id: string, data: Record<string, any>) =>
      stripeRequest<StripePaymentMethod>("POST", `/payment_methods/${id}/attach`, data),
    detach: (id: string) => stripeRequest<StripePaymentMethod>("POST", `/payment_methods/${id}/detach`),
  },
  paymentIntents: {
    create: (data: Record<string, any>) => stripeRequest<StripePaymentIntent>("POST", "/payment_intents", data),
    retrieve: (id: string) => stripeRequest<StripePaymentIntent>("GET", `/payment_intents/${id}`),
    update: (id: string, data: Record<string, any>) =>
      stripeRequest<StripePaymentIntent>("POST", `/payment_intents/${id}`, data),
    confirm: (id: string, data?: Record<string, any>) =>
      stripeRequest<StripePaymentIntent>("POST", `/payment_intents/${id}/confirm`, data),
    cancel: (id: string, data?: Record<string, any>) =>
      stripeRequest<StripePaymentIntent>("POST", `/payment_intents/${id}/cancel`, data),
  },
  refunds: {
    create: (data: Record<string, any>) => stripeRequest<StripeRefund>("POST", "/refunds", data),
    retrieve: (id: string) => stripeRequest<StripeRefund>("GET", `/refunds/${id}`),
    update: (id: string, data: Record<string, any>) => stripeRequest<StripeRefund>("POST", `/refunds/${id}`, data),
    list: (params?: Record<string, any>) => stripeRequest<StripeListResponse<StripeRefund>>("GET", "/refunds", params),
  },
}


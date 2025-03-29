import type { Request, Response, NextFunction } from "express"
import stripeService from "../service/stripe-service"

class PaymentController {
  /**
   * Get a customer by email
   */
  async getCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.params

      if (!email) {
        res.status(400).json({ success: false, message: "Email is required" })
        return
      }

      const customer = await stripeService.getCustomer(email)

      if (!customer) {
        res.status(404).json({
          success: false,
          message: "Customer not found",
        })
        return
      }

      res.json({
        success: true,
        data: customer,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Create a new customer
   */
  async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, name } = req.body

      if (!email) {
        res.status(400).json({ success: false, message: "Email is required" })
        return
      }

      const customerId = await stripeService.createCustomer(email, name)

      res.status(201).json({
        success: true,
        data: { customerId },
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Add a new payment method to a customer
   */
  async addPaymentMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId, paymentMethodId } = req.body

      if (!customerId || !paymentMethodId) {
        res.status(400).json({
          success: false,
          message: "Customer ID and Payment Method ID are required",
        })
        return
      }

      const paymentMethod = await stripeService.addPaymentMethod(customerId, paymentMethodId)

      res.json({
        success: true,
        data: paymentMethod,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Add a payment method with card details
   */
  async addPaymentMethodWithDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId, paymentMethodId, cardholderName, last4, cardType, expiryDate, isDefault } = req.body

      if (!customerId || !paymentMethodId) {
        res.status(400).json({
          success: false,
          message: "Customer ID and Payment Method ID are required",
        })
        return
      }

      if (!cardholderName || !last4 || !cardType || !expiryDate) {
        res.status(400).json({
          success: false,
          message: "Card details (cardholderName, last4, cardType, expiryDate) are required",
        })
        return
      }

      const cardDetails = {
        cardholderName,
        last4,
        cardType,
        expiryDate,
        isDefault: isDefault || false,
      }

      const paymentMethod = await stripeService.addPaymentMethodWithDetails(customerId, paymentMethodId, cardDetails)

      res.json({
        success: true,
        data: paymentMethod,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId, paymentMethodId } = req.body

      if (!customerId || !paymentMethodId) {
        res.status(400).json({
          success: false,
          message: "Customer ID and Payment Method ID are required",
        })
        return
      }

      const result = await stripeService.deletePaymentMethod(customerId, paymentMethodId)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * List all payment methods for a customer
   */
  async listPaymentMethods(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId } = req.params

      if (!customerId) {
        res.status(400).json({ success: false, message: "Customer ID is required" })
        return
      }

      const paymentMethods = await stripeService.listPaymentMethods(customerId)

      res.json({
        success: true,
        data: paymentMethods,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, customerId, paymentMethodId, orderId, currency, returnUrl } = req.body
      // Get the auth token from the request headers
      const authToken = req.headers.authorization?.split(" ")[1]

      if (!amount || !customerId || !paymentMethodId || !orderId) {
        res.status(400).json({
          success: false,
          message: "Amount, Customer ID, Payment Method ID, and Order ID are required",
        })
        return
      }

      // Parse amount to ensure it's a number
      const parsedAmount = Number.parseFloat(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({
          success: false,
          message: "Amount must be a positive number",
        })
        return
      }

      // Log the request parameters
      console.log("Creating payment intent with parameters:", {
        amount: parsedAmount,
        customerId,
        paymentMethodId,
        orderId,
        currency,
        returnUrl: returnUrl || "Not provided",
      })

      const paymentIntent = await stripeService.createPaymentIntent(
        parsedAmount,
        customerId,
        paymentMethodId,
        orderId,
        currency,
        returnUrl,
        authToken,
      )

      res.json({
        success: true,
        data: paymentIntent,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentIntentId, amount, reason } = req.body

      if (!paymentIntentId) {
        res.status(400).json({ success: false, message: "Payment Intent ID is required" })
        return
      }

      const refund = await stripeService.refundPayment(paymentIntentId, amount, reason)

      res.json({
        success: true,
        data: refund,
      })
    } catch (error) {
      next(error)
    }
  }
}

// Create a singleton instance
const paymentController = new PaymentController()

// Bind all methods to the instance to preserve 'this' context
Object.getOwnPropertyNames(PaymentController.prototype)
  .filter((prop) => typeof (paymentController as any)[prop] === "function" && prop !== "constructor")
  .forEach((method) => {
    ;(paymentController as any)[method] = (paymentController as any)[method].bind(paymentController)
  })

export default paymentController


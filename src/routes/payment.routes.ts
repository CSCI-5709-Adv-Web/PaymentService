import { Router, type Request, type Response, type NextFunction } from "express"
import paymentController from "../controllers/payment.controller"

// Create router instance
const router = Router()

// Define route handlers with explicit typing

// Customer routes
router.get("/customer/:email", (req: Request, res: Response, next: NextFunction) =>
  paymentController.getCustomer(req, res, next),
)

router.post("/customer", (req: Request, res: Response, next: NextFunction) =>
  paymentController.createCustomer(req, res, next),
)

// Payment method routes
router.post("/payment-method", (req: Request, res: Response, next: NextFunction) =>
  paymentController.addPaymentMethod(req, res, next),
)

router.post("/payment-method-details", (req: Request, res: Response, next: NextFunction) =>
  paymentController.addPaymentMethodWithDetails(req, res, next),
)

router.delete("/payment-method", (req: Request, res: Response, next: NextFunction) =>
  paymentController.deletePaymentMethod(req, res, next),
)

router.get("/payment-methods/:customerId", (req: Request, res: Response, next: NextFunction) =>
  paymentController.listPaymentMethods(req, res, next),
)

// Payment processing routes
router.post("/payment-intent", (req: Request, res: Response, next: NextFunction) =>
  paymentController.createPaymentIntent(req, res, next),
)

router.post("/refund", (req: Request, res: Response, next: NextFunction) =>
  paymentController.refundPayment(req, res, next),
)

export default router


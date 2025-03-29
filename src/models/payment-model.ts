import mongoose, { type Document, Schema } from "mongoose"

export interface IPayment extends Document {
  orderId: string
  customerId: string
  paymentMethodId: string
  paymentIntentId: string
  amount: number
  currency: string
  status: string
  refunded: boolean
  refundAmount?: number
  refundId?: string
  createdAt: Date
  updatedAt?: Date
}

const PaymentSchema = new Schema<IPayment>({
  orderId: {
    type: String,
    required: true,
    index: true,
  },
  customerId: {
    type: String,
    required: true,
    index: true,
  },
  paymentMethodId: {
    type: String,
    required: true,
  },
  paymentIntentId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "usd",
  },
  status: {
    type: String,
    required: true,
  },
  refunded: {
    type: Boolean,
    default: false,
  },
  refundAmount: {
    type: Number,
  },
  refundId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
})

export const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema)


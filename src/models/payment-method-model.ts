import mongoose, { type Document, Schema } from "mongoose"

export interface IPaymentMethod extends Document {
  customerId: string
  stripeCustomerId: string
  paymentMethodId: string
  cardholderName: string
  last4: string
  cardType: string
  expiryDate: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
      index: true,
    },
    paymentMethodId: {
      type: String,
      required: true,
      unique: true,
    },
    cardholderName: {
      type: String,
      required: true,
    },
    last4: {
      type: String,
      required: true,
    },
    cardType: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

export const PaymentMethodModel = mongoose.model<IPaymentMethod>("PaymentMethod", PaymentMethodSchema)


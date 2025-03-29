import mongoose, { type Document, Schema } from "mongoose"

export interface ICustomer extends Document {
  email: string
  name?: string
  stripeCustomerId: string
  paymentMethods: string[]
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomer>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentMethods: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
)

export const CustomerModel = mongoose.model<ICustomer>("Customer", CustomerSchema)


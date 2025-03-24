import { logger } from "../utils";
import mongoose from "mongoose";
import {Payment} from "../db/Models/payment.model"

const create = async (paymentData) => {
  const payment = new Payment(paymentData);
  return await payment.save();
};

const findByOrderId = async (orderId) => {
  return await Payment.findOne({ orderId });
};

export = {
  create,
  findByOrderId
}
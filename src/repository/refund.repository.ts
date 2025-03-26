// src/repository/refund.repository.ts
import { Refund } from '../db/Models/refund.model';

const refundRepository = {
  create: async (refundData) => {
    const refund = new Refund(refundData);
    return await refund.save();
  },
  
  findByOrderId: async (orderId) => {
    return await Refund.findOne({ orderId });
  },
  
  findByRefundId: async (stripeRefundId) => {
    return await Refund.findOne({ stripeRefundId });
  },
  
  findAll: async () => {
    return await Refund.find({});
  }
};

export default refundRepository;
import dotenv from 'dotenv';
dotenv.config();

import mongoose, { ConnectOptions } from 'mongoose';
import { logger } from '../utils';

const DB_URL = process.env.MONGODB_URI || ''; // ✅ Fix the variable name

export const ConnectWithDB = async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    logger.info('✅ MongoDB connected in order-service...');
  } catch (err) {
    logger.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

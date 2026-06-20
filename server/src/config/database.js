import mongoose from 'mongoose';

import { env } from './env.js';

export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(env.mongodbUri);

  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};

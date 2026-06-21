import mongoose from 'mongoose';

import { env } from './env.js';

const connectionStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

let listenersConfigured = false;

const configureConnectionListeners = () => {
  if (listenersConfigured) return;

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  listenersConfigured = true;
};

export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);
  configureConnectionListeners();

  const connection = await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 0,
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};

export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

export const checkDatabaseHealth = async ({ timeoutMs = 2000 } = {}) => {
  const state = connectionStates[mongoose.connection.readyState] || 'unknown';

  if (state !== 'connected' || !mongoose.connection.db) {
    return state;
  }

  let timeout;

  try {
    await Promise.race([
      mongoose.connection.db.admin().ping(),
      new Promise((resolve, reject) => {
        timeout = setTimeout(() => reject(new Error('MongoDB health check timed out')), timeoutMs);
      }),
    ]);

    return 'connected';
  } catch {
    return 'unavailable';
  } finally {
    clearTimeout(timeout);
  }
};

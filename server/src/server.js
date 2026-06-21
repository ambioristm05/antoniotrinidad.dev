import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

let httpServer;
let shutdownPromise;

export const startServer = async () => {
  await connectDatabase();

  return new Promise((resolve, reject) => {
    const handleError = (error) => reject(error);

    httpServer = app.listen(env.port, () => {
      httpServer.off('error', handleError);
      console.log(`API running on port ${env.port} in ${env.nodeEnv} mode`);
      resolve(httpServer);
    });
    httpServer.requestTimeout = 30000;
    httpServer.headersTimeout = 35000;
    httpServer.keepAliveTimeout = 5000;
    httpServer.maxRequestsPerSocket = 1000;
    httpServer.once('error', handleError);
  });
};

const closeHttpServer = () =>
  new Promise((resolve, reject) => {
    if (!httpServer?.listening) {
      resolve();
      return;
    }

    httpServer.close((error) => (error ? reject(error) : resolve()));
  });

export const shutdown = (signal, exitCode = 0) => {
  if (shutdownPromise) return shutdownPromise;

  shutdownPromise = (async () => {
    console.log(`${signal} received. Shutting down gracefully...`);

    const forceExit = setTimeout(() => {
      console.error('Graceful shutdown timed out');
      process.exit(1);
    }, 10000);
    forceExit.unref();

    try {
      await closeHttpServer();
      await disconnectDatabase();
      clearTimeout(forceExit);
      console.log('Server shutdown complete');
      process.exitCode = exitCode;
    } catch (error) {
      clearTimeout(forceExit);
      console.error('Failed to shut down cleanly:', error.message);
      process.exitCode = 1;
    }
  })();

  return shutdownPromise;
};

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  void shutdown('uncaughtException', 1);
});
process.once('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  void shutdown('unhandledRejection', 1);
});

startServer().catch(async (error) => {
  console.error('Failed to start server:', error.message);
  await disconnectDatabase();
  process.exitCode = 1;
});

import { checkDatabaseHealth } from '../config/database.js';

export const getHealth = async (req, res) => {
  const database = await checkDatabaseHealth();
  const isHealthy = database === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'success' : 'fail',
    message: isHealthy ? 'API is healthy' : 'API is not ready',
    services: {
      database,
    },
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
};

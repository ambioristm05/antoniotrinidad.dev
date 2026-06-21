import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { ensureAdmin } from '../services/admin.service.js';

const createAdmin = async () => {
  if (!env.adminEmail || !env.adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to create an admin user');
  }

  await connectDatabase();

  const { admin, created } = await ensureAdmin({
    name: env.adminName,
    email: env.adminEmail,
    password: env.adminPassword,
  });

  console.log(`${created ? 'Admin created' : 'Admin already exists'}: ${admin.email}`);
};

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });

import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { resetAdminPassword } from '../services/admin.service.js';

const run = async () => {
  if (!env.adminEmail || !env.adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to reset the admin password');
  }

  await connectDatabase();

  const admin = await resetAdminPassword({
    email: env.adminEmail,
    password: env.adminPassword,
  });

  console.log(`Admin password reset: ${admin.email}`);
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });

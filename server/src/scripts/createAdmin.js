import { connectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const createAdmin = async () => {
  if (!env.adminEmail || !env.adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to create an admin user');
  }

  await connectDatabase();

  const existingAdmin = await User.findOne({ email: env.adminEmail });

  if (existingAdmin) {
    console.log(`Admin already exists: ${env.adminEmail}`);
    process.exit(0);
  }

  await User.create({
    name: env.adminName,
    email: env.adminEmail,
    passwordHash: env.adminPassword,
    role: 'admin',
  });

  console.log(`Admin created: ${env.adminEmail}`);
  process.exit(0);
};

createAdmin().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

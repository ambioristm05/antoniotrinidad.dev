import { User } from '../models/User.js';

export const ensureAdmin = async ({ name, email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedName = name?.trim() || 'Admin';

  if (!normalizedEmail || !password) {
    throw new Error('Admin email and password are required');
  }

  if (password.length < 8) {
    throw new Error('Admin password must have at least 8 characters');
  }

  const existingAdmin = await User.findOne({ email: normalizedEmail });

  if (existingAdmin) {
    return {
      admin: existingAdmin,
      created: false,
    };
  }

  const admin = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    passwordHash: password,
    role: 'admin',
  });

  return {
    admin,
    created: true,
  };
};

export const resetAdminPassword = async ({ email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new Error('Admin email and password are required');
  }

  if (password.length < 8) {
    throw new Error('Admin password must have at least 8 characters');
  }

  const admin = await User.findOne({ email: normalizedEmail });

  if (!admin) {
    throw new Error('Admin user not found');
  }

  admin.passwordHash = password;
  await admin.save();

  return admin;
};

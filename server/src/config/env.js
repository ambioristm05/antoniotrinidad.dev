import dotenv from 'dotenv';

dotenv.config();

const allowedNodeEnvs = ['development', 'test', 'production'];

const getRequiredEnv = (key) => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const nodeEnv = process.env.NODE_ENV?.trim() || 'development';

if (!allowedNodeEnvs.includes(nodeEnv)) {
  throw new Error(`NODE_ENV must be one of: ${allowedNodeEnvs.join(', ')}`);
}

const parsePort = () => {
  const value = process.env.PORT?.trim() || '5000';
  const port = Number(value);
  const isTestPort = nodeEnv === 'test' && port === 0;

  if (!Number.isInteger(port) || (!isTestPort && (port < 1 || port > 65535))) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
};

const validateClientUrl = (value) => {
  try {
    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Unsupported protocol');
    }

    return url.origin;
  } catch {
    throw new Error('CLIENT_URL must be a valid HTTP or HTTPS URL');
  }
};

const getOptionalEnv = (key) => process.env[key]?.trim() || '';

const parseCloudinaryConfig = () => {
  const cloudName = getOptionalEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = getOptionalEnv('CLOUDINARY_API_KEY');
  const apiSecret = getOptionalEnv('CLOUDINARY_API_SECRET');
  const values = [cloudName, apiKey, apiSecret];

  if (values.some(Boolean) && values.some((value) => !value)) {
    throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be configured together');
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder: getOptionalEnv('CLOUDINARY_FOLDER') || 'antoniotrinidad-dev',
    enabled: values.every(Boolean),
  };
};

const parseTrustProxy = () => {
  const value = process.env.TRUST_PROXY?.trim();

  if (!value || value === '0' || value === 'false') return false;

  const hops = Number(value);

  if (!Number.isInteger(hops) || hops < 1) {
    throw new Error('TRUST_PROXY must be false, 0 or a positive integer');
  }

  return hops;
};

const mongodbUri = getRequiredEnv('MONGODB_URI');
const jwtSecret = getRequiredEnv('JWT_SECRET');
const jwtExpiresIn = process.env.JWT_EXPIRES_IN?.trim() || '7d';
const clientUrl = validateClientUrl(process.env.CLIENT_URL || 'http://localhost:5173');
const cloudinary = parseCloudinaryConfig();

if (!/^mongodb(?:\+srv)?:\/\//.test(mongodbUri)) {
  throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
}

if (jwtSecret.length < 16) {
  throw new Error('JWT_SECRET must contain at least 16 characters');
}

if (nodeEnv === 'production' && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must contain at least 32 characters in production');
}

if (!/^\d+(?:ms|s|m|h|d|w|y)$/.test(jwtExpiresIn)) {
  throw new Error('JWT_EXPIRES_IN must use a value such as 15m, 1h or 7d');
}

if (nodeEnv === 'production' && !clientUrl.startsWith('https://')) {
  throw new Error('CLIENT_URL must use HTTPS in production');
}

if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length < 8) {
  throw new Error('ADMIN_PASSWORD must contain at least 8 characters when configured');
}

if (nodeEnv === 'production' && process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length < 12) {
  throw new Error('ADMIN_PASSWORD must contain at least 12 characters in production');
}

export const env = {
  port: parsePort(),
  nodeEnv,
  mongodbUri,
  jwtSecret,
  jwtExpiresIn,
  clientUrl,
  trustProxy: parseTrustProxy(),
  adminName: process.env.ADMIN_NAME || 'Admin',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  cloudinary,
  get isDevelopment() {
    return this.nodeEnv === 'development';
  },
  get isProduction() {
    return this.nodeEnv === 'production';
  },
};

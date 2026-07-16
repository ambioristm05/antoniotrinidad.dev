import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const serverRoot = fileURLToPath(new URL('..', import.meta.url));
const importEnv = "await import('./src/config/env.js')";

const validEnv = {
  ...process.env,
  NODE_ENV: 'test',
  PORT: '0',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/antoniotrinidad-test',
  JWT_SECRET: 'test-secret-with-more-than-16-characters',
  CLIENT_URL: 'http://localhost:5173',
  TRUST_PROXY: '0',
  ADMIN_NAME: '',
  ADMIN_EMAIL: '',
  ADMIN_PASSWORD: '',
  CLOUDINARY_CLOUD_NAME: '',
  CLOUDINARY_API_KEY: '',
  CLOUDINARY_API_SECRET: '',
  CLOUDINARY_FOLDER: '',
  RESEND_API_KEY: '',
  EMAIL_FROM: '',
  CONTACT_NOTIFICATION_EMAIL: '',
};

const loadEnv = (overrides = {}) =>
  spawnSync(process.execPath, ['--input-type=module', '-e', importEnv], {
    cwd: serverRoot,
    env: {
      ...validEnv,
      ...overrides,
    },
    encoding: 'utf8',
  });

describe('Environment configuration', () => {
  it('accepts a valid test configuration', () => {
    const result = loadEnv();

    assert.equal(result.status, 0, result.stderr);
  });

  it('rejects a missing MongoDB URI', () => {
    const result = loadEnv({ MONGODB_URI: '' });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Missing required environment variable: MONGODB_URI/);
  });

  it('rejects invalid ports', () => {
    const result = loadEnv({ PORT: '70000' });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /PORT must be an integer between 1 and 65535/);
  });

  it('rejects weak JWT secrets', () => {
    const result = loadEnv({ JWT_SECRET: 'too-short' });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /JWT_SECRET must contain at least 16 characters/);
  });

  it('rejects invalid client URLs', () => {
    const result = loadEnv({ CLIENT_URL: 'localhost:5173' });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /CLIENT_URL must be a valid HTTP or HTTPS URL/);
  });

  it('rejects invalid trust proxy values', () => {
    const result = loadEnv({ TRUST_PROXY: 'all' });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /TRUST_PROXY must be false, 0 or a positive integer/);
  });

  it('requires complete Cloudinary credentials when image uploads are configured', () => {
    const result = loadEnv({
      CLOUDINARY_CLOUD_NAME: 'demo',
      CLOUDINARY_API_KEY: '',
      CLOUDINARY_API_SECRET: 'secret',
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be configured together/);
  });

  it('requires complete Resend credentials when password reset emails are configured', () => {
    const result = loadEnv({
      RESEND_API_KEY: 're_123',
      EMAIL_FROM: '',
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /RESEND_API_KEY and EMAIL_FROM must be configured together/);
  });

  it('requires stronger secrets and HTTPS in production', () => {
    const weakSecret = loadEnv({
      NODE_ENV: 'production',
      PORT: '5000',
      JWT_SECRET: 'valid-in-tests-only',
      CLIENT_URL: 'https://antoniotrinidad.dev',
    });
    const insecureClientUrl = loadEnv({
      NODE_ENV: 'production',
      PORT: '5000',
      JWT_SECRET: 'a-secure-production-secret-with-32-chars',
      CLIENT_URL: 'http://antoniotrinidad.dev',
    });

    assert.equal(weakSecret.status, 1);
    assert.match(weakSecret.stderr, /JWT_SECRET must contain at least 32 characters in production/);
    assert.equal(insecureClientUrl.status, 1);
    assert.match(insecureClientUrl.stderr, /CLIENT_URL must use HTTPS in production/);
  });

  it('requires password reset email settings in production', () => {
    const result = loadEnv({
      NODE_ENV: 'production',
      PORT: '5000',
      JWT_SECRET: 'a-secure-production-secret-with-32-chars',
      CLIENT_URL: 'https://antoniotrinidad.dev',
      RESEND_API_KEY: '',
      EMAIL_FROM: '',
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /RESEND_API_KEY and EMAIL_FROM are required in production for password reset emails/);
  });

  it('accepts password reset email settings in production', () => {
    const result = loadEnv({
      NODE_ENV: 'production',
      PORT: '5000',
      JWT_SECRET: 'a-secure-production-secret-with-32-chars',
      CLIENT_URL: 'https://antoniotrinidad.dev',
      RESEND_API_KEY: 're_123',
      EMAIL_FROM: 'Antonio Trinidad <no-reply@antoniotrinidad.dev>',
    });

    assert.equal(result.status, 0, result.stderr);
  });
});

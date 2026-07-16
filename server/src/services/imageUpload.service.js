import crypto from 'node:crypto';

import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const allowedFolders = new Set(['projects', 'posts', 'general']);

const buildSignature = (params, apiSecret) => {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
};

const normalizeFolder = (folder = 'general') => {
  const safeFolder = allowedFolders.has(folder) ? folder : 'general';
  return `${env.cloudinary.folder}/${safeFolder}`;
};

export const uploadImageToCloudinary = async ({ dataUrl, folder = 'general' }) => {
  if (!env.cloudinary.enabled) {
    throw new AppError('Image uploads are not configured. Add Cloudinary credentials or paste an existing image URL.', 503);
  }

  const timestamp = Math.round(Date.now() / 1000);
  const uploadFolder = normalizeFolder(folder);
  const signedParams = {
    folder: uploadFolder,
    timestamp,
  };
  const body = new FormData();

  body.set('file', dataUrl);
  body.set('api_key', env.cloudinary.apiKey);
  body.set('folder', uploadFolder);
  body.set('timestamp', String(timestamp));
  body.set('signature', buildSignature(signedParams, env.cloudinary.apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/image/upload`, {
    method: 'POST',
    body,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AppError(payload?.error?.message || 'Image upload failed', response.status);
  }

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
    width: payload.width,
    height: payload.height,
    format: payload.format,
    bytes: payload.bytes,
  };
};

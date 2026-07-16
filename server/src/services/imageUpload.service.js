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

const extractCloudinaryPublicId = (imageUrl) => {
  if (!env.cloudinary.enabled || !imageUrl) return null;

  try {
    const url = new URL(imageUrl);

    if (url.hostname !== 'res.cloudinary.com') return null;

    const segments = url.pathname.split('/').filter(Boolean).map((segment) => decodeURIComponent(segment));
    const uploadIndex = segments.indexOf('upload');
    const versionIndex = segments.findIndex((segment, index) => index > uploadIndex && /^v\d+$/.test(segment));

    if (uploadIndex === -1 || versionIndex === -1 || versionIndex === segments.length - 1) return null;
    if (segments[0] !== env.cloudinary.cloudName || segments[1] !== 'image') return null;

    const publicIdParts = segments.slice(versionIndex + 1);
    const lastPart = publicIdParts.at(-1);
    const extensionIndex = lastPart.lastIndexOf('.');

    publicIdParts[publicIdParts.length - 1] = extensionIndex > 0 ? lastPart.slice(0, extensionIndex) : lastPart;

    const publicId = publicIdParts.join('/');

    return publicId.startsWith(`${env.cloudinary.folder}/`) ? publicId : null;
  } catch {
    return null;
  }
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

export const deleteImageFromCloudinary = async (imageUrl) => {
  const publicId = extractCloudinaryPublicId(imageUrl);

  if (!publicId) return null;

  const timestamp = Math.round(Date.now() / 1000);
  const signedParams = {
    public_id: publicId,
    timestamp,
  };
  const body = new FormData();

  body.set('public_id', publicId);
  body.set('api_key', env.cloudinary.apiKey);
  body.set('timestamp', String(timestamp));
  body.set('signature', buildSignature(signedParams, env.cloudinary.apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/image/destroy`, {
    method: 'POST',
    body,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AppError(payload?.error?.message || 'Image delete failed', response.status);
  }

  return payload;
};

export const cleanupUnusedCloudinaryImages = async (previousImages, currentImages = []) => {
  const current = new Set(currentImages.filter(Boolean));
  const removedImages = [...new Set(previousImages.filter(Boolean))].filter((imageUrl) => !current.has(imageUrl));

  await Promise.allSettled(removedImages.map((imageUrl) => deleteImageFromCloudinary(imageUrl)));
};
